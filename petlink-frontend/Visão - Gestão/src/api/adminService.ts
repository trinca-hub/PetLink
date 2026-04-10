import { api } from "@/src/api/api";

async function getCount(endpoint: string, token?: string) {
  const result = await api(endpoint, "GET", null, token);

  if (!result.ok) {
    return 0;
  }

  const list = result?.data?.data;
  return Array.isArray(list) ? list.length : 0;
}

export async function getAdminSummary(token?: string) {
  const [funcionarios, veterinarios, usuarios, produtos, anuncios] = await Promise.all([
    getCount("Funcionario", token),
    getCount("Veterinario", token),
    getCount("Usuario", token),
    getCount("Produto", token),
    getCount("Anuncio", token),
  ]);

  return {
    funcionarios,
    veterinarios,
    usuarios,
    produtos,
    anuncios,
  };
}
