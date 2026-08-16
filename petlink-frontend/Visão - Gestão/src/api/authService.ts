import { api } from "./api";

export type PerfilGestao = "adm" | "vet" | "func";

const LOGIN_ENDPOINTS: Record<PerfilGestao, string> = {
  adm: "Administrador/Login",
  vet: "Veterinario/Login",
  func: "Funcionario/Login",
};

export function loginGestaoService(perfil: PerfilGestao, email: string, senha: string) {
  return api(LOGIN_ENDPOINTS[perfil], "POST", {
    email,
    senha,
    password: senha,
  });
}

export function getMeGestaoService(perfil: PerfilGestao, token: string) {
  const endpointByPerfil: Record<PerfilGestao, string> = {
    adm: "Administrador/me",
    vet: "Veterinario/me",
    func: "Funcionario/me",
  };

  return api(endpointByPerfil[perfil], "GET", null, token);
}

export function requestManagementPasswordReset(perfil: PerfilGestao, email: string) {
  return api("GestaoSeguranca/recuperar-senha", "POST", { perfil, email });
}

export function resetManagementPassword(perfil: PerfilGestao, email: string, token: string, novaSenha: string) {
  return api("GestaoSeguranca/redefinir-senha", "POST", { perfil, email, token, novaSenha });
}
