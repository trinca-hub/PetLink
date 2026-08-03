export type ApiResponse<T> = {
  message?: string;
  data: T;
  error?: string | null;
};

export type StatusAgendamento = "Pendente" | "Confirmado" | "Cancelado" | "Recusado";
export type TipoServico = 1 | 2 | 3;

export const TIPO_SERVICO_LABEL: Record<number, string> = {
  1: "Consulta",
  2: "Banho",
  3: "Tosa",
};

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

export type SlotDisponivel = {
  dataHoraInicio: string;
  dataHoraFim: string;
};

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
