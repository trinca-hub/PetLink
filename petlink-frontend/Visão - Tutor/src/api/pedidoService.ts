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

export async function getPedidoById(id: number, token?: string) {
  // GET /api/v1/Pedido/{id}
  return api(`Pedido/${id}`, "GET", undefined, token);
}

export async function getPedidosByUsuario(usuarioId: number, token?: string) {
  // GET /api/v1/Pedido/usuario/{usuarioId}
  return api(`Pedido/usuario/${usuarioId}`, "GET", undefined, token);
}

export async function getItensPorPedido(pedidoId: number, token?: string) {
  // GET /api/v1/ItemPedido/pedido/{pedidoId}
  return api(`ItemPedido/pedido/${pedidoId}`, "GET", undefined, token);
}
