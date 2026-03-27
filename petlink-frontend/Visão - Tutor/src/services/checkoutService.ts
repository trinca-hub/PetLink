import { criarItemPedido, criarPedido } from "@/src/api/pedidoService";

export type CheckoutItemInput = {
  produtoId: number;
  nome: string;
  quantidade: number;
  preco?: number;
  foto?: string;
};

export type CheckoutItemError = {
  item: CheckoutItemInput;
  message: string;
};

export type CheckoutStatus = "success" | "partial" | "failed";

export type CheckoutResult = {
  ok: boolean;
  status: CheckoutStatus;
  pedidoId?: number;
  confirmedItems: CheckoutItemInput[];
  failedItems: CheckoutItemError[];
  generalError?: string;
};

type RetryOptions = {
  timeoutMs?: number;
  retryCount?: number;
};

const DEFAULT_TIMEOUT_MS = 12000;
const DEFAULT_RETRY_COUNT = 1;

function normalizeMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Falha de rede ao processar a compra.";
}

function isSuccessStatus(status: number) {
  return status >= 200 && status < 300;
}

function parseResponseError(data: unknown, fallback: string) {
  if (!data || typeof data !== "object") return fallback;
  const candidate = data as { message?: unknown; Message?: unknown };

  if (typeof candidate.message === "string" && candidate.message.trim()) {
    return candidate.message;
  }

  if (typeof candidate.Message === "string" && candidate.Message.trim()) {
    return candidate.Message;
  }

  return fallback;
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  let timeoutHandle: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error("Tempo de resposta esgotado. Tente novamente."));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

async function runWithRetry<T>(
  operation: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = options?.retryCount ?? DEFAULT_RETRY_COUNT;
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retries) {
    try {
      return await withTimeout(operation(), timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt >= retries) {
        throw error;
      }
      await delay(300 * (attempt + 1));
      attempt += 1;
    }
  }

  throw lastError;
}

function extractNumericCandidate(value: unknown): number | null {
  const numeric = Number(value);
  if (!isFinite(numeric) || numeric <= 0) return null;
  return numeric;
}

export function extractPedidoId(payload: unknown): number | null {
  if (!payload || typeof payload !== "object") return null;

  const body = payload as {
    data?: unknown;
    id?: unknown;
    Id?: unknown;
    pedidoId?: unknown;
    PedidoId?: unknown;
  };

  const rootCandidates = [
    body.id,
    body.Id,
    body.pedidoId,
    body.PedidoId,
  ];

  for (const candidate of rootCandidates) {
    const parsed = extractNumericCandidate(candidate);
    if (parsed) return parsed;
  }

  const data = body.data;

  if (Array.isArray(data) && data.length > 0 && data[0] && typeof data[0] === "object") {
    const first = data[0] as { id?: unknown; Id?: unknown; pedidoId?: unknown; PedidoId?: unknown };
    const candidates = [first.id, first.Id, first.pedidoId, first.PedidoId];
    for (const candidate of candidates) {
      const parsed = extractNumericCandidate(candidate);
      if (parsed) return parsed;
    }
    return null;
  }

  if (!data || typeof data !== "object") return null;

  const nested = data as { id?: unknown; Id?: unknown; pedidoId?: unknown; PedidoId?: unknown };
  const nestedCandidates = [nested.id, nested.Id, nested.pedidoId, nested.PedidoId];

  for (const candidate of nestedCandidates) {
    const parsed = extractNumericCandidate(candidate);
    if (parsed) return parsed;
  }

  return null;
}

function normalizeItems(items: CheckoutItemInput[]) {
  return items
    .map((item) => ({
      ...item,
      produtoId: Number(item.produtoId),
      quantidade: Math.max(1, Math.floor(Number(item.quantidade) || 1)),
    }))
    .filter((item) => isFinite(item.produtoId) && item.produtoId > 0);
}

export async function checkoutFromItems(
  userId: number,
  token: string,
  items: CheckoutItemInput[],
  options?: RetryOptions
): Promise<CheckoutResult> {
  const normalizedItems = normalizeItems(items);

  if (!userId || !token || normalizedItems.length === 0) {
    return {
      ok: false,
      status: "failed",
      confirmedItems: [],
      failedItems: normalizedItems.map((item) => ({
        item,
        message: "Item inválido para compra.",
      })),
      generalError: "Dados de compra inválidos.",
    };
  }

  try {
    const pedidoRes = await runWithRetry(
      () => criarPedido({ usuarioId: userId, dataPedido: new Date().toISOString() }, token),
      options
    );

    const pedidoPayload = (pedidoRes as { data?: unknown; ok?: boolean; status?: number }) ?? {};
    const requestOk = pedidoPayload.ok === true || isSuccessStatus(Number(pedidoPayload.status));

    if (!requestOk) {
      return {
        ok: false,
        status: "failed",
        confirmedItems: [],
        failedItems: normalizedItems.map((item) => ({
          item,
          message: "Pedido não foi criado.",
        })),
        generalError: parseResponseError(pedidoPayload.data, "Erro ao criar pedido."),
      };
    }

    const pedidoId = extractPedidoId(pedidoPayload.data);

    if (!pedidoId) {
      return {
        ok: false,
        status: "failed",
        confirmedItems: [],
        failedItems: normalizedItems.map((item) => ({
          item,
          message: "Pedido criado sem ID válido.",
        })),
        generalError: "Pedido criado, mas não retornou ID válido.",
      };
    }

    const confirmedItems: CheckoutItemInput[] = [];
    const failedItems: CheckoutItemError[] = [];

    for (const item of normalizedItems) {
      try {
        const itemRes = await runWithRetry(
          () =>
            criarItemPedido(
              { pedidoId, produtoId: item.produtoId, quantidade: item.quantidade },
              token
            ),
          options
        );

        const itemPayload = (itemRes as { data?: unknown; ok?: boolean; status?: number }) ?? {};
        const itemRequestOk = itemPayload.ok === true || isSuccessStatus(Number(itemPayload.status));

        if (!itemRequestOk) {
          failedItems.push({
            item,
            message: parseResponseError(itemPayload.data, `Falha ao processar ${item.nome}.`),
          });
          continue;
        }

        confirmedItems.push(item);
      } catch (error) {
        failedItems.push({
          item,
          message: normalizeMessage(error),
        });
      }
    }

    const status: CheckoutStatus =
      confirmedItems.length === normalizedItems.length
        ? "success"
        : confirmedItems.length > 0
          ? "partial"
          : "failed";

    return {
      ok: status !== "failed",
      status,
      pedidoId,
      confirmedItems,
      failedItems,
      generalError:
        status === "failed"
          ? "Nenhum item foi confirmado no pedido."
          : undefined,
    };
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      confirmedItems: [],
      failedItems: normalizedItems.map((item) => ({
        item,
        message: normalizeMessage(error),
      })),
      generalError: normalizeMessage(error),
    };
  }
}
