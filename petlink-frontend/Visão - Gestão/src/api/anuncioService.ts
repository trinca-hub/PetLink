import { api } from "@/src/api/api";

export type AdminAnuncio = {
  anuncioId: number;
  descricao: string;
  tipoAnuncio: number;
  tipoAnuncioLabel: string;
  dataCriacao: string;

  fotoPet?: string | null;
  nomePet: string;
  idadePet: string;
  sexoPet: string;
  racaPet: string;
  tipoPet: string;

  usuarioId: number;
  nomeUsuario: string;
  telefoneUsuario: string;
  cidade: string;
  uf: string;
  bairro: string;
  rua: string;
  numero: number;

  ultimoLocalVisto?: string | null;
  dataDesaparecimento?: string | null;

  tipoPayPet?: number | null;
  valor?: number | null;
};

export function getAdminAnuncios(token: string) {
  return api("Anuncio/admin/feed", "GET", null, token);
}

export function updateAdminAnuncioDescricao(id: number, descricao: string, token: string) {
  return api(`Anuncio/admin/${id}`, "PUT", { descricao }, token);
}

export function updateAdminAnuncioPetfinder(
  id: number,
  payload: { ultimoLocalVisto: string; dataDesaparecimento: string },
  token: string
) {
  return api(`Anuncio/admin/${id}/petfinder`, "PUT", payload, token);
}

export function updateAdminAnuncioPaypet(
  id: number,
  payload: { tipoPayPet: number; valor: number | null },
  token: string
) {
  return api(`Anuncio/admin/${id}/paypet`, "PUT", payload, token);
}

export function deleteAdminAnuncio(id: number, token: string) {
  return api(`Anuncio/admin/${id}`, "DELETE", null, token);
}
