import { api } from "@/src/api/api";

export function getAgendaVeterinario(veterinarioId: number, token: string) {
  return api(`AgendaVeterinario/${veterinarioId}`, "GET", null, token);
}

export function getAgendaSlots(veterinarioId: number, token: string) {
  return api(`AgendaVeterinario/${veterinarioId}/slots`, "GET", null, token);
}
