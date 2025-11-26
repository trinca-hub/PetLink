import { api } from "./api";

export function loginService(email: string, senha: string) {
  return api("Login", "POST", { email, senha });
}

export function registerService(nome: string, email: string, senha: string) {
  return api("Usuarios", "POST", { nome, email, senha });
}
