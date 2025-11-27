const API_URL = "http://192.168.18.74:5078/api/v1";

export async function api(
  endpoint: string,
  method: string = "GET",
  body?: any
) {
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  console.log("➡️ Fetch:", `${API_URL}/${endpoint}`);

  const response = await fetch(`${API_URL}/${endpoint}`, config);
  return await response.json();
}
