import { api } from "@/src/api/api";

export type Usuario = {
  id: number;
  nome: string;
  telefone: string;
  cep: string;
  uf: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: number;
  email: string;
};

export function getUsuarios(token: string) {
  return api("Usuario", "GET", null, token);
}

export function deleteUsuario(id: number, token: string) {
  return api(`Usuario/${id}`, "DELETE", null, token);
}
