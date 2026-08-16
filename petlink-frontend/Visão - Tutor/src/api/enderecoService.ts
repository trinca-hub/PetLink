import { api } from "@/src/api/api";

export type EnderecoUsuario = {
  id?: number;
  usuarioId: number;
  apelido: string;
  destinatario: string;
  telefone: string;
  cep: string;
  uf: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: number;
  complemento?: string;
  referencia?: string;
  principal: boolean;
  ativo?: boolean;
  criadoEm?: string;
};

export async function getEnderecosUsuario(usuarioId: number, token?: string) {
  return api(`EnderecoUsuario/usuario/${usuarioId}`, "GET", undefined, token);
}

export async function criarEnderecoUsuario(body: EnderecoUsuario, token?: string) {
  return api("EnderecoUsuario", "POST", body, token);
}

export async function atualizarEnderecoUsuario(id: number, body: EnderecoUsuario, token?: string) {
  return api(`EnderecoUsuario/${id}`, "PUT", body, token);
}

export async function definirEnderecoPrincipal(id: number, token?: string) {
  return api(`EnderecoUsuario/${id}/principal`, "PUT", undefined, token);
}

export async function removerEnderecoUsuario(id: number, token?: string) {
  return api(`EnderecoUsuario/${id}`, "DELETE", undefined, token);
}
