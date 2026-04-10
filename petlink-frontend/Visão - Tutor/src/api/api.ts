const BASE_URL = "http://192.168.103.67:5078/api/v1";


export async function api(
  endpoint: string,
  method: string = "GET",
  body?: any,
  token?: string
) {
  const headers: any = {
    "Content-Type": "application/json",
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      
    });
console.log(`[API] Chamando: ${BASE_URL}/${endpoint}`);

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error("❌ Erro na requisição:", error);
    console.error("[API] Erro de conexão:", error);
    return { ok: false, status: 0, data: { message: "Erro de conexão com o servidor" } };
  }
}
