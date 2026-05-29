import { api } from "@/src/api/api";

export type StatusAgendamento = "Pendente" | "Confirmado" | "Cancelado";
export type TipoServico = "Consulta" | string;

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
  dataCriacao?: string | null;
  dataConfirmacao?: string | null;
  dataCancelamento?: string | null;
  rowVersion?: string | null;
};

export type CreateAgendamentoPayload = {
  veterinarioId: number;
  petId: number;
  tipoServico: TipoServico;
  observacao?: string;
};

export function createAgendamento(payload: CreateAgendamentoPayload, token: string) {
  return api("Agendamento", "POST", payload, token);
}

export function getAgendamentosVeterinario(token: string) {
  return api("Agendamento/veterinario", "GET", null, token);
}

export function getAgendamentoById(id: number, token: string) {
  return api(`Agendamento/${id}`, "GET", null, token);
}
