import { api } from "./api";

export function loginService(email: string, senha: string) {
  return api("Usuario/Login", "POST", {
    email,
    password: senha
  });
}


export function registerService(data: any) {
  return api("Usuario", "POST", data);
}
