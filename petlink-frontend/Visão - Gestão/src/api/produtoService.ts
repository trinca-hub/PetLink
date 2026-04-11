import { api } from "@/src/api/api";

export type Produto = {
  id: number;
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
  foto?: string;
};

type ProdutoPayload = {
  id?: number;
  nome: string;
  preco: number;
  descricao: string;
  quantidade: number;
  foto?: string;
};

export function getProdutos(token: string) {
  return api("Produto", "GET", null, token);
}

export function createProduto(payload: ProdutoPayload, token: string) {
  return api("Produto", "POST", payload, token);
}

export function updateProduto(id: number, payload: ProdutoPayload, token: string) {
  return api(`Produto/${id}`, "PUT", payload, token);
}

export function deleteProduto(id: number, token: string) {
  return api(`Produto/${id}`, "DELETE", null, token);
}
