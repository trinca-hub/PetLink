import { api } from "@/src/api/api";
import { TipoServico } from "@/src/types/agendamento";

export type CreateAgendamentoPayload = {
  veterinarioId: number;
  petId: number;
  tipoServico: TipoServico;
  dataHoraInicio?: string;
  observacao?: string;
};

export type ConfirmarAgendamentoPayload = {
  dataHoraInicio?: string;
};

export type CancelarAgendamentoPayload = {
  motivo?: string;
};

export type RecusarAgendamentoPayload = {
  motivo: string;
};

export type RemarcarAgendamentoPayload = {
  dataHoraInicio: string;
  motivo?: string;
};

export function createAgendamento(payload: CreateAgendamentoPayload, token: string) {
  return api("Agendamento", "POST", payload, token);
}

export function getAgendamentoById(id: number, token: string) {
  return api(`Agendamento/${id}`, "GET", null, token);
}

export function getAgendamentosTutor(token: string) {
  return api("Agendamento/tutor", "GET", null, token);
}

export function confirmarAgendamento(
  id: number,
  payload: ConfirmarAgendamentoPayload,
  token: string
) {
  return api(`Agendamento/${id}/confirmar`, "PUT", payload, token);
}

export function cancelarAgendamento(
  id: number,
  payload: CancelarAgendamentoPayload | null,
  token: string
) {
  return api(`Agendamento/${id}/cancelar`, "PUT", payload, token);
}

export function recusarAgendamento(id: number, payload: RecusarAgendamentoPayload, token: string) {
  return api(`Agendamento/${id}/recusar`, "PUT", payload, token);
}

export function remarcarAgendamento(id: number, payload: RemarcarAgendamentoPayload, token: string) {
  return api(`Agendamento/${id}/remarcar`, "PUT", payload, token);
}

export function getVeterinarios(token: string) {
  return api("Veterinario", "GET", null, token);
}
