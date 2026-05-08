import { api } from "@/src/api/api";

export type ItemPedido = {
  id: number;
  pedidoId: number;
  produtoId: number;
  quantidade: number;
};

export type ItemPedidoPayload = {
  pedidoId: number;
  produtoId: number;
  quantidade: number;
};

export function getAdminItensPedido(token: string) {
  return api("ItemPedido/admin", "GET", null, token);
}

export function getAdminItensByPedido(pedidoId: number, token: string) {
  return api(`ItemPedido/admin/pedido/${pedidoId}`, "GET", null, token);
}

export function createAdminItemPedido(payload: ItemPedidoPayload, token: string) {
  return api("ItemPedido/admin", "POST", payload, token);
}

export function deleteAdminItemPedido(id: number, token: string) {
  return api(`ItemPedido/admin/${id}`, "DELETE", null, token);
}
