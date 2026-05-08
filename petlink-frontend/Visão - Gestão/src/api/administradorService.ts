import { api } from "@/src/api/api";

export type Administrador = {
  id: number;
  nome: string;
  email: string;
  status: number;
  senha?: string;
};

type AdministradorPayload = {
  id?: number;
  nome: string;
  email: string;
  status: number;
  senha: string;
};

export function getAdministradores(token: string) {
  return api("Administrador", "GET", null, token);
}

export function createAdministrador(payload: AdministradorPayload, token: string) {
  return api("Administrador", "POST", payload, token);
}

export function deleteAdministrador(id: number, token: string) {
  return api(`Administrador/${id}`, "DELETE", null, token);
}
