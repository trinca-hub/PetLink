export type ApiResponse<T> = {
  message?: string;
  data: T;
  error?: string | null;
};

export type StatusAgendamento = "Pendente" | "Confirmado" | "Cancelado";
export type TipoServico = "Consulta" | string;

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
  dataCriacao?: string | null;
  dataConfirmacao?: string | null;
  dataCancelamento?: string | null;
  rowVersion?: string | null;
};
