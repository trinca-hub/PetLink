import { api } from "@/src/api/api";

export async function getProdutos(token?: string) {
  // GET /api/v1/Produto
  return api("Produto", "GET", undefined, token);
}

export async function getProdutoById(id: number, token?: string) {
  // GET /api/v1/Produto/{id}
  return api(`Produto/${id}`, "GET", undefined, token);
}
