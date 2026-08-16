import { api } from "@/src/api/api";

export type Veterinario = {
  id: number;
  nome: string;
  email: string;
  crmv: string;
  salario: number;
  // A API serializa enums como texto ("ATIVO"/"DESATIVO"), mas versões
  // anteriores podem retornar o valor numérico.
  status: number | "ATIVO" | "DESATIVO";
  senha?: string;
};

type VeterinarioPayload = {
  id?: number;
  nome: string;
  email: string;
  crmv: string;
  salario: number;
  status: number;
  senha?: string;
};

export function getVeterinarios(token: string) {
  return api("Veterinario", "GET", null, token);
}

export function createVeterinario(payload: VeterinarioPayload, token: string) {
  return api("Veterinario", "POST", payload, token);
}

export function updateVeterinario(id: number, payload: VeterinarioPayload, token: string) {
  return api(`Veterinario/${id}`, "PUT", payload, token);
}

export function deleteVeterinario(id: number, token: string) {
  return api(`Veterinario/${id}`, "DELETE", null, token);
}
