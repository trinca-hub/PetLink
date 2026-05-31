import { api } from "@/src/api/api";

export type Pet = {
  id: number;
  nome: string;
  raca: string;
  sexo: string;
  rga: string;
  idade: string;
  peso: number;
  castrado: boolean;
  foto?: string | null;
  tipoPet: number;
  usuarioId: number;
};

export type PetPayload = {
  nome: string;
  raca: string;
  sexo: string;
  rga: string;
  idade: string;
  peso: number;
  castrado: boolean;
  foto?: string;
  tipoPet: number;
  usuarioId: number;
};

export function getAdminPets(token: string) {
  return api("Pet/admin", "GET", null, token);
}

export function getPetsByUsuario(usuarioId: number, token: string) {
  return api(`Pet/usuario/${usuarioId}`, "GET", null, token);
}

export function createAdminPet(payload: PetPayload, token: string) {
  return api("Pet/admin", "POST", payload, token);
}

export function updateAdminPet(id: number, payload: PetPayload, token: string) {
  return api(`Pet/admin/${id}`, "PUT", payload, token);
}

export function deleteAdminPet(id: number, token: string) {
  return api(`Pet/admin/${id}`, "DELETE", null, token);
}
