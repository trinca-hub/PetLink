import { api } from "@/src/api/api";
import { TipoServico } from "@/src/types/agendamento";

export type CreateAgendamentoPayload = {
  veterinarioId: number;
  petId: number;
  tipoServico: TipoServico;
  observacao?: string;
};

export type ConfirmarAgendamentoPayload = {
  dataHoraInicio: string;
};

export type CancelarAgendamentoPayload = {
  motivoCancelamento?: string;
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
