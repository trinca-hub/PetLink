import { api } from "@/src/api/api";
import { SlotDisponivel } from "@/src/types/agendamento";

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

export function getAgendaSlots(veterinarioId: number, token: string) {
  return api(`AgendaVeterinario/${veterinarioId}/slots`, "GET", null, token);
}
