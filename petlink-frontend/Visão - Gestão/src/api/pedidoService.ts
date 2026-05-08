import { api } from "@/src/api/api";

export type Pedido = {
  id: number;
  usuarioId: number;
  dataPedido: string;
};

export type AdminCreatePedidoPayload = {
  usuarioId?: number;
  emNomeProprio: boolean;
  dataPedido?: string;
};

export function getAdminPedidos(token: string) {
  return api("Pedido/admin", "GET", null, token);
}

export function createAdminPedido(payload: AdminCreatePedidoPayload, token: string) {
  return api("Pedido/admin", "POST", payload, token);
}

export function cancelAdminPedido(id: number, token: string) {
  return api(`Pedido/admin/${id}`, "DELETE", null, token);
}
