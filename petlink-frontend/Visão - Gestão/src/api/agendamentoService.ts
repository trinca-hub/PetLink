import { api } from "@/src/api/api";

export type StatusAgendamento = "Pendente" | "Confirmado" | "Cancelado" | "Recusado";
export type TipoServico = 1 | 2 | 3;

export type AgendamentoConsulta = {
  id: number;
  veterinarioId: number;
  petId: number;
  usuarioId: number;
  dataHoraInicio?: string | null;
  dataHoraFim?: string | null;
  status: StatusAgendamento;
  tipoServico: TipoServico;
  observacao?: string | null;
  motivoCancelamento?: string | null;
  motivoRecusa?: string | null;
  motivoRemarcacao?: string | null;
  dataCriacao?: string | null;
  dataConfirmacao?: string | null;
  dataCancelamento?: string | null;
  dataRecusa?: string | null;
  dataUltimaRemarcacao?: string | null;
  rowVersion?: string | null;
};

export type CreateAgendamentoPayload = {
  veterinarioId: number;
  petId: number;
  tipoServico: TipoServico;
  dataHoraInicio?: string;
  observacao?: string;
};

export type CreateAgendamentoVeterinarioPayload = {
  usuarioId: number;
  petId: number;
  tipoServico: TipoServico;
  dataHoraInicio?: string;
  observacao?: string;
};

export type CancelarAgendamentoPayload = {
  motivo?: string;
};

export type ConfirmarAgendamentoPayload = {
  dataHoraInicio?: string;
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

export function createAgendamentoVeterinario(
  payload: CreateAgendamentoVeterinarioPayload,
  token: string
) {
  return api("Agendamento/veterinario", "POST", payload, token);
}

export function getAgendamentosVeterinario(token: string) {
  return api("Agendamento/veterinario", "GET", null, token);
}

export function getAgendamentoById(id: number, token: string) {
  return api(`Agendamento/${id}`, "GET", null, token);
}

export function cancelarAgendamento(
  id: number,
  payload: CancelarAgendamentoPayload | null,
  token: string
) {
  return api(`Agendamento/${id}/cancelar`, "PUT", payload, token);
}

export function confirmarAgendamento(id: number, payload: ConfirmarAgendamentoPayload, token: string) {
  return api(`Agendamento/${id}/confirmar`, "PUT", payload, token);
}

export function recusarAgendamento(id: number, payload: RecusarAgendamentoPayload, token: string) {
  return api(`Agendamento/${id}/recusar`, "PUT", payload, token);
}

export function remarcarAgendamento(id: number, payload: RemarcarAgendamentoPayload, token: string) {
  return api(`Agendamento/${id}/remarcar`, "PUT", payload, token);
}
