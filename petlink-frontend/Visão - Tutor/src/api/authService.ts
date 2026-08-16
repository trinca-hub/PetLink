import { api } from "./api";

export function loginService(email: string, senha: string) {
  return api("Usuario/Login", "POST", {
    email,
    password: senha,
  });
}

export function registerService(data: any) {
  return api("Usuario", "POST", data);
}

export function requestPasswordResetService(email: string) {
  return api("Usuario/recuperar-senha", "POST", { email });
}

export function resetPasswordService(email: string, token: string, novaSenha: string) {
  return api("Usuario/redefinir-senha", "POST", { email, token, novaSenha });
}

export async function getMyPetsService(token: string) {
  return api("Pet/meus", "GET", null, token);
}

export async function getMeService(token: string) {
  return api("Usuario/me", "GET", null, token);
}

export async function updateUserService(id: number, data: any, token: string) {
  return api(`Usuario/${id}`, "PUT", data, token);
}
