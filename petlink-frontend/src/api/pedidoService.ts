import { api } from "@/src/api/api";

export async function criarPedido(body: { usuarioId: number; dataPedido: string }, token?: string) {
  // POST /api/v1/Pedido
  return api("Pedido", "POST", body, token);
}

export async function criarItemPedido(
  body: { pedidoId: number; produtoId: number; quantidade: number },
  token?: string
) {
  // POST /api/v1/ItemPedido
  return api("ItemPedido", "POST", body, token);
}
