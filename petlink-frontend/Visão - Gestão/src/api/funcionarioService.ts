import { api } from "@/src/api/api";

export type Funcionario = {
  id: number;
  nome: string;
  email: string;
  salario: number;
  senha?: string;
};

type FuncionarioPayload = {
  nome: string;
  email: string;
  salario: number;
  senha: string;
};

export function getFuncionarios(token: string) {
  return api("Funcionario", "GET", null, token);
}

export function createFuncionario(payload: FuncionarioPayload, token: string) {
  return api("Funcionario", "POST", payload, token);
}

export function updateFuncionario(id: number, payload: FuncionarioPayload, token: string) {
  return api(`Funcionario/${id}`, "PUT", payload, token);
}

export function deleteFuncionario(id: number, token: string) {
  return api(`Funcionario/${id}`, "DELETE", null, token);
}
