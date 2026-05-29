using AutoMapper;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Data;
using PetLink_BackEnd.Objects.Dtos.Entities.AgendamentoConsulta;
using PetLink_BackEnd.Objects.Enums;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Objects.Enums;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities
{
    public class AgendamentoService : IAgendamentoService
    {
        private readonly IAgendamentoConsultaRepository _agendamentoRepository;
        private readonly IAgendaVeterinarioRepository _agendaRepository;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public AgendamentoService(
            IAgendamentoConsultaRepository agendamentoRepository,
            IAgendaVeterinarioRepository agendaRepository,
            AppDbContext context,
            IMapper mapper)
        {
            _agendamentoRepository = agendamentoRepository;
            _agendaRepository = agendaRepository;
            _context = context;
            _mapper = mapper;
        }

        public async Task<AgendamentoConsultaDTO> CriarSolicitacao(CriarSolicitacaoConsultaDTO dto, int usuarioId)
        {
            if (await _agendamentoRepository.ExistsPendenteDuplicado(dto.VeterinarioId, dto.PetId, usuarioId))
                throw new InvalidOperationException("Já existe solicitação pendente para este pet e veterinário.");

            if (!Enum.IsDefined(typeof(TipoServico), dto.TipoServico))
                throw new InvalidOperationException("Tipo de serviço inválido.");

            var agendamento = new AgendamentoConsulta
            {
                VeterinarioId = dto.VeterinarioId,
                PetId = dto.PetId,
                UsuarioId = usuarioId,
                Status = StatusAgendamento.Pendente,
                TipoServico = dto.TipoServico,
                Observacao = dto.Observacao,
                DataCriacao = DateTime.UtcNow
            };

            await _agendamentoRepository.Add(agendamento);
            return _mapper.Map<AgendamentoConsultaDTO>(agendamento);
        }

        public async Task<IEnumerable<AgendamentoConsultaDTO>> ListarSolicitacoesTutor(int usuarioId)
        {
            var agendamentos = await _agendamentoRepository.GetByUsuarioId(usuarioId);
            return agendamentos.Select(a => _mapper.Map<AgendamentoConsultaDTO>(a));
        }

        public async Task<IEnumerable<AgendamentoConsultaDTO>> ListarSolicitacoesVeterinario(int veterinarioId)
        {
            var agendamentos = await _agendamentoRepository.GetByVeterinarioId(veterinarioId);
            return agendamentos.Select(a => _mapper.Map<AgendamentoConsultaDTO>(a));
        }

        public async Task<AgendamentoConsultaDTO> BuscarPorId(int id)
        {
            var agendamento = await _agendamentoRepository.GetWithRelations(id);
            return _mapper.Map<AgendamentoConsultaDTO>(agendamento);
        }

        public async Task<AgendamentoConsultaDTO> ConfirmarConsulta(int id, ConfirmarConsultaDTO dto, int usuarioId)
        {
            var agendamento = await _agendamentoRepository.GetByIdForUpdate(id);
            if (agendamento == null)
                return null;

            if (agendamento.UsuarioId != usuarioId)
                throw new UnauthorizedAccessException("Solicitação não pertence ao usuário.");

            if (agendamento.Status != StatusAgendamento.Pendente)
                throw new InvalidOperationException("Somente solicitações pendentes podem ser confirmadas.");

            if (agendamento.DataHoraInicio.HasValue || agendamento.DataHoraFim.HasValue)
                throw new InvalidOperationException("Solicitação já possui horário atribuído.");

            var agenda = await _agendaRepository.GetByVeterinarioId(agendamento.VeterinarioId);
            if (agenda == null)
                throw new InvalidOperationException("Veterinário não possui agenda configurada.");

            if (dto.DataHoraInicio <= DateTime.UtcNow)
                throw new InvalidOperationException("Não é permitido confirmar horários no passado.");

            var slots = await GerarSlotsAgenda(agenda, DateTime.UtcNow.Date);
            if (!slots.Contains(dto.DataHoraInicio))
                throw new InvalidOperationException("Horário fora da agenda configurada.");

            var fim = dto.DataHoraInicio.AddMinutes(agenda.DuracaoMinutos);

            await using var transaction = await _context.Database.BeginTransactionAsync();
            var conflito = await _agendamentoRepository.ExistsConfirmadoConflito(agendamento.VeterinarioId, dto.DataHoraInicio, fim, id);
            if (conflito)
                throw new InvalidOperationException("Conflito com outro agendamento confirmado.");

            agendamento.DataHoraInicio = dto.DataHoraInicio;
            agendamento.DataHoraFim = fim;
            agendamento.Status = StatusAgendamento.Confirmado;
            agendamento.DataConfirmacao = DateTime.UtcNow;

            await _agendamentoRepository.Update(agendamento);
            await transaction.CommitAsync();
            return _mapper.Map<AgendamentoConsultaDTO>(agendamento);
        }

        public async Task<AgendamentoConsultaDTO> CancelarConsulta(int id, CancelarConsultaDTO dto, int usuarioId, int? veterinarioId)
        {
            var agendamento = await _agendamentoRepository.GetByIdForUpdate(id);
            if (agendamento == null)
                return null;

            if (agendamento.Status == StatusAgendamento.Cancelado)
                throw new InvalidOperationException("Solicitação já está cancelada.");

            var isTutor = agendamento.UsuarioId == usuarioId;
            var isVet = veterinarioId.HasValue && agendamento.VeterinarioId == veterinarioId.Value;

            if (!isTutor && !isVet)
                throw new UnauthorizedAccessException("Solicitação não pertence ao usuário ou veterinário.");

            agendamento.Status = StatusAgendamento.Cancelado;
            agendamento.DataCancelamento = DateTime.UtcNow;

            agendamento.DataConfirmacao = null;

            if (!string.IsNullOrWhiteSpace(dto.Motivo))
            {
                if (dto.Motivo.Length > 500)
                    throw new InvalidOperationException("Motivo de cancelamento excede o limite de 500 caracteres.");

                agendamento.MotivoCancelamento = dto.Motivo;
            }

            await _agendamentoRepository.Update(agendamento);
            return _mapper.Map<AgendamentoConsultaDTO>(agendamento);
        }

        private static Task<HashSet<DateTime>> GerarSlotsAgenda(AgendaVeterinario agenda, DateTime dataInicio)
        {
            var slots = new HashSet<DateTime>();
            var duracao = TimeSpan.FromMinutes(agenda.DuracaoMinutos);
            var diasAtivos = ParseDiasSemana(agenda.DiasSemanaAtivos);

            for (var i = 0; i < 7; i++)
            {
                var dia = dataInicio.AddDays(i);
                if (!diasAtivos.Contains(dia.DayOfWeek))
                    continue;

                var inicioManha = dia.Add(agenda.HoraInicioManha);
                var fimManha = dia.Add(agenda.HoraFimManha);
                var inicioTarde = dia.Add(agenda.HoraInicioTarde);
                var fimTarde = dia.Add(agenda.HoraFimTarde);

                AddSlotsPeriodo(slots, inicioManha, fimManha, duracao);
                AddSlotsPeriodo(slots, inicioTarde, fimTarde, duracao);
            }

            return Task.FromResult(slots);
        }

        private static void AddSlotsPeriodo(HashSet<DateTime> slots, DateTime inicio, DateTime fim, TimeSpan duracao)
        {
            var atual = inicio;
            while (atual.Add(duracao) <= fim)
            {
                if (atual >= DateTime.UtcNow)
                    slots.Add(atual);
                atual = atual.Add(duracao);
            }
        }

        private static HashSet<DayOfWeek> ParseDiasSemana(DiasSemana diasSemana)
        {
            var resultado = new HashSet<DayOfWeek>();
            if (diasSemana == DiasSemana.Nenhum)
                return resultado;

            if (diasSemana.HasFlag(DiasSemana.Domingo)) resultado.Add(DayOfWeek.Sunday);
            if (diasSemana.HasFlag(DiasSemana.Segunda)) resultado.Add(DayOfWeek.Monday);
            if (diasSemana.HasFlag(DiasSemana.Terca)) resultado.Add(DayOfWeek.Tuesday);
            if (diasSemana.HasFlag(DiasSemana.Quarta)) resultado.Add(DayOfWeek.Wednesday);
            if (diasSemana.HasFlag(DiasSemana.Quinta)) resultado.Add(DayOfWeek.Thursday);
            if (diasSemana.HasFlag(DiasSemana.Sexta)) resultado.Add(DayOfWeek.Friday);
            if (diasSemana.HasFlag(DiasSemana.Sabado)) resultado.Add(DayOfWeek.Saturday);

            return resultado;
        }
    }
}
