import { api } from "@/src/api/api";

export type DiaSemana =
  | "Domingo"
  | "Segunda"
  | "Terca"
  | "Quarta"
  | "Quinta"
  | "Sexta"
  | "Sabado";

export type AgendaVeterinario = {
  id: number;
  veterinarioId: number;
  diasSemanaAtivos: string;
  horaInicioManha: string;
  horaFimManha: string;
  horaInicioTarde: string;
  horaFimTarde: string;
  duracaoMinutos: number;
  dataCriacao?: string | null;
};

export type AgendaVeterinarioPayload = {
  veterinarioId: number;
  diasSemanaAtivos: string;
  horaInicioManha: string;
  horaFimManha: string;
  horaInicioTarde: string;
  horaFimTarde: string;
  duracaoMinutos: number;
};

export type SlotDisponivel = {
  dataHoraInicio: string;
  dataHoraFim: string;
};

export function getAgendaVeterinario(veterinarioId: number, token: string) {
  return api(`AgendaVeterinario/${veterinarioId}`, "GET", null, token);
}

export function createAgendaVeterinario(payload: AgendaVeterinarioPayload, token: string) {
  return api("AgendaVeterinario", "POST", payload, token);
}

export function updateAgendaVeterinario(id: number, payload: AgendaVeterinarioPayload, token: string) {
  return api(`AgendaVeterinario/${id}`, "PUT", payload, token);
}

export function getAgendaSlots(veterinarioId: number, token: string) {
  return api(`AgendaVeterinario/${veterinarioId}/slots`, "GET", null, token);
}
