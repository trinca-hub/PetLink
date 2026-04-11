import { api } from "@/src/api/api";

export type Servico = {
  id: number;
  dataServico: string;
  descricao: string;
  tipo: number;
  valor: number;
  petId: number;
};

export type ServicoPayload = {
  dataServico: string;
  descricao: string;
  tipo: number;
  valor: number;
  petId: number;
};

export function getAdminServicos(token: string) {
  return api("Servico/admin", "GET", null, token);
}

export function createAdminServico(payload: ServicoPayload, token: string) {
  return api("Servico/admin", "POST", payload, token);
}

export function updateAdminServico(id: number, payload: ServicoPayload, token: string) {
  return api(`Servico/admin/${id}`, "PUT", payload, token);
}

export function deleteAdminServico(id: number, token: string) {
  return api(`Servico/admin/${id}`, "DELETE", null, token);
}
