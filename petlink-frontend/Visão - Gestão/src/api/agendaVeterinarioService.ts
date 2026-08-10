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
  diasSemanaAtivos: string | number;
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

export function isDataHoraDentroHorarioAtendimento(dataHoraInicio: string, dataHoraFim?: string) {
  const inicio = new Date(dataHoraInicio);
  const fim = dataHoraFim ? new Date(dataHoraFim) : new Date(inicio.getTime() + 60 * 60 * 1000);
  if (Number.isNaN(inicio.getTime()) || Number.isNaN(fim.getTime())) return false;

  const inicioMinutos = inicio.getHours() * 60 + inicio.getMinutes();
  const fimMinutos = fim.getHours() * 60 + fim.getMinutes();
  const periodoManha = inicioMinutos >= 8 * 60 && fimMinutos <= 11 * 60;
  const periodoTarde = inicioMinutos >= 13 * 60 && fimMinutos <= 17 * 60;
  return periodoManha || periodoTarde;
}

export function isSlotDentroHorarioAtendimento(slot: SlotDisponivel) {
  return isDataHoraDentroHorarioAtendimento(slot.dataHoraInicio, slot.dataHoraFim);
}

export function filtrarSlotsHorarioAtendimento(slots: SlotDisponivel[]) {
  return slots.filter(isSlotDentroHorarioAtendimento);
}

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

export function bloquearAgendaSlot(payload: { veterinarioId: number; dataHoraInicio: string; motivo?: string }, token: string) {
  return api("AgendaVeterinario/bloquear-slot", "POST", payload, token);
}
