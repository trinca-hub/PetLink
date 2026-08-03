using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Dtos.Entities.AgendamentoConsulta;
using PetLink_BackEnd.Objects.Enums;
using PetLink_BackEnd.Objects.Models;
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

            var petPertence = await _context.Set<Pet>()
                .AsNoTracking()
                .AnyAsync(p => p.Id == dto.PetId && p.UsuarioId == usuarioId);

            if (!petPertence)
                throw new InvalidOperationException("Pet não pertence ao usuário autenticado.");

            DateTime? fim = null;
            if (dto.DataHoraInicio.HasValue)
                fim = await ValidarSlotDisponivel(dto.VeterinarioId, dto.DataHoraInicio.Value, null);

            var agendamento = new AgendamentoConsulta
            {
                VeterinarioId = dto.VeterinarioId,
                PetId = dto.PetId,
                UsuarioId = usuarioId,
                DataHoraInicio = dto.DataHoraInicio.HasValue ? NormalizarDataHoraSlot(dto.DataHoraInicio.Value) : null,
                DataHoraFim = fim,
                Status = StatusAgendamento.Pendente,
                TipoServico = dto.TipoServico,
                Observacao = dto.Observacao,
                DataCriacao = DateTime.UtcNow
            };

            await _agendamentoRepository.Add(agendamento);
            return _mapper.Map<AgendamentoConsultaDTO>(agendamento);
        }

        public async Task<AgendamentoConsultaDTO> CriarSolicitacaoVeterinario(CriarSolicitacaoVeterinarioDTO dto, int veterinarioId)
        {
            if (dto.UsuarioId <= 0 || dto.PetId <= 0)
                throw new InvalidOperationException("Dados inválidos.");

            if (await _agendamentoRepository.ExistsPendenteDuplicado(veterinarioId, dto.PetId, dto.UsuarioId))
                throw new InvalidOperationException("Já existe solicitação pendente para este pet e veterinário.");

            if (!Enum.IsDefined(typeof(TipoServico), dto.TipoServico))
                throw new InvalidOperationException("Tipo de serviço inválido.");

            var petPertence = await _context.Set<Pet>()
                .AsNoTracking()
                .AnyAsync(p => p.Id == dto.PetId && p.UsuarioId == dto.UsuarioId);

            if (!petPertence)
                throw new InvalidOperationException("Pet não pertence ao usuário informado.");

            DateTime? fim = null;
            if (dto.DataHoraInicio.HasValue)
                fim = await ValidarSlotDisponivel(veterinarioId, dto.DataHoraInicio.Value, null);

            var agendamento = new AgendamentoConsulta
            {
                VeterinarioId = veterinarioId,
                PetId = dto.PetId,
                UsuarioId = dto.UsuarioId,
                DataHoraInicio = dto.DataHoraInicio.HasValue ? NormalizarDataHoraSlot(dto.DataHoraInicio.Value) : null,
                DataHoraFim = fim,
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

        public async Task<AgendamentoConsultaDTO> ConfirmarConsulta(int id, ConfirmarConsultaDTO dto, int usuarioId, int? veterinarioId)
        {
            var agendamento = await _agendamentoRepository.GetByIdForUpdate(id);
            if (agendamento == null)
                return null;

            ValidarAcesso(agendamento, usuarioId, veterinarioId);

            if (agendamento.Status != StatusAgendamento.Pendente)
                throw new InvalidOperationException("Somente solicitações pendentes podem ser confirmadas.");

            var inicio = dto.DataHoraInicio ?? agendamento.DataHoraInicio;
            if (!inicio.HasValue)
                throw new InvalidOperationException("Selecione um horário para confirmar.");

            var fim = await ValidarSlotDisponivel(agendamento.VeterinarioId, inicio.Value, id);

            await using var transaction = await _context.Database.BeginTransactionAsync();
            agendamento.DataHoraInicio = NormalizarDataHoraSlot(inicio.Value);
            agendamento.DataHoraFim = fim;
            agendamento.Status = StatusAgendamento.Confirmado;
            agendamento.DataConfirmacao = DateTime.UtcNow;
            agendamento.DataCancelamento = null;
            agendamento.DataRecusa = null;

            await _agendamentoRepository.Update(agendamento);
            await transaction.CommitAsync();
            return _mapper.Map<AgendamentoConsultaDTO>(agendamento);
        }

        public async Task<AgendamentoConsultaDTO> RecusarConsulta(int id, RecusarConsultaDTO dto, int usuarioId, int? veterinarioId)
        {
            var agendamento = await _agendamentoRepository.GetByIdForUpdate(id);
            if (agendamento == null)
                return null;

            ValidarAcesso(agendamento, usuarioId, veterinarioId);

            if (agendamento.Status == StatusAgendamento.Cancelado || agendamento.Status == StatusAgendamento.Recusado)
                throw new InvalidOperationException("Solicitação já foi encerrada.");

            if (string.IsNullOrWhiteSpace(dto.Motivo))
                throw new InvalidOperationException("Informe o motivo da recusa.");

            if (dto.Motivo.Length > 500)
                throw new InvalidOperationException("Motivo da recusa excede o limite de 500 caracteres.");

            agendamento.Status = StatusAgendamento.Recusado;
            agendamento.MotivoRecusa = dto.Motivo.Trim();
            agendamento.DataRecusa = DateTime.UtcNow;
            agendamento.DataConfirmacao = null;

            await _agendamentoRepository.Update(agendamento);
            return _mapper.Map<AgendamentoConsultaDTO>(agendamento);
        }

        public async Task<AgendamentoConsultaDTO> RemarcarConsulta(int id, RemarcarConsultaDTO dto, int usuarioId, int? veterinarioId)
        {
            var agendamento = await _agendamentoRepository.GetByIdForUpdate(id);
            if (agendamento == null)
                return null;

            ValidarAcesso(agendamento, usuarioId, veterinarioId);

            if (agendamento.Status == StatusAgendamento.Cancelado || agendamento.Status == StatusAgendamento.Recusado)
                throw new InvalidOperationException("Solicitação encerrada não pode ser remarcada.");

            var fim = await ValidarSlotDisponivel(agendamento.VeterinarioId, dto.DataHoraInicio, id);

            agendamento.DataHoraInicio = NormalizarDataHoraSlot(dto.DataHoraInicio);
            agendamento.DataHoraFim = fim;
            agendamento.Status = StatusAgendamento.Pendente;
            agendamento.DataConfirmacao = null;
            agendamento.DataUltimaRemarcacao = DateTime.UtcNow;
            agendamento.MotivoRemarcacao = string.IsNullOrWhiteSpace(dto.Motivo) ? null : dto.Motivo.Trim();

            await _agendamentoRepository.Update(agendamento);
            return _mapper.Map<AgendamentoConsultaDTO>(agendamento);
        }

        public async Task<AgendamentoConsultaDTO> CancelarConsulta(int id, CancelarConsultaDTO dto, int usuarioId, int? veterinarioId)
        {
            var agendamento = await _agendamentoRepository.GetByIdForUpdate(id);
            if (agendamento == null)
                return null;

            if (agendamento.Status == StatusAgendamento.Cancelado)
                throw new InvalidOperationException("Solicitação já está cancelada.");

            ValidarAcesso(agendamento, usuarioId, veterinarioId);

            agendamento.Status = StatusAgendamento.Cancelado;
            agendamento.DataCancelamento = DateTime.UtcNow;
            agendamento.DataConfirmacao = null;

            if (!string.IsNullOrWhiteSpace(dto?.Motivo))
            {
                if (dto.Motivo.Length > 500)
                    throw new InvalidOperationException("Motivo de cancelamento excede o limite de 500 caracteres.");

                agendamento.MotivoCancelamento = dto.Motivo.Trim();
            }

            await _agendamentoRepository.Update(agendamento);
            return _mapper.Map<AgendamentoConsultaDTO>(agendamento);
        }

        private async Task<DateTime> ValidarSlotDisponivel(int veterinarioId, DateTime inicio, int? ignorarAgendamentoId)
        {
            inicio = NormalizarDataHoraSlot(inicio);

            var agenda = await _agendaRepository.GetByVeterinarioId(veterinarioId);
            if (agenda == null)
                throw new InvalidOperationException("Veterinário não possui agenda configurada.");

            if (inicio <= DateTime.UtcNow)
                throw new InvalidOperationException("Não é permitido usar horários no passado.");

            var slots = await GerarSlotsAgenda(agenda, DateTime.UtcNow.Date);
            if (!slots.Contains(inicio))
                throw new InvalidOperationException("Horário fora da agenda configurada.");

            var bloqueios = await _context.Set<AgendaSlotBloqueado>()
                .AsNoTracking()
                .Where(b => b.VeterinarioId == veterinarioId)
                .Select(b => b.DataHoraInicio)
                .ToListAsync();

            if (bloqueios.Any(b => SlotKey(b) == SlotKey(inicio)))
                throw new InvalidOperationException("Horário removido da agenda pelo veterinário.");

            var fim = inicio.AddMinutes(agenda.DuracaoMinutos);
            var conflito = await _agendamentoRepository.ExistsConfirmadoConflito(veterinarioId, inicio, fim, ignorarAgendamentoId);
            if (conflito)
                throw new InvalidOperationException("Conflito com outro agendamento confirmado.");

            return fim;
        }

        private static void ValidarAcesso(AgendamentoConsulta agendamento, int usuarioId, int? veterinarioId)
        {
            var isTutor = agendamento.UsuarioId == usuarioId;
            var isVet = veterinarioId.HasValue && agendamento.VeterinarioId == veterinarioId.Value;

            if (!isTutor && !isVet)
                throw new UnauthorizedAccessException("Solicitação não pertence ao usuário ou veterinário.");
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

                AddSlotsPeriodo(slots, dia.Add(agenda.HoraInicioManha), dia.Add(agenda.HoraFimManha), duracao);
                AddSlotsPeriodo(slots, dia.Add(agenda.HoraInicioTarde), dia.Add(agenda.HoraFimTarde), duracao);
            }

            return Task.FromResult(slots);
        }

        private static DateTime NormalizarDataHoraSlot(DateTime dataHora)
        {
            var utc = dataHora.Kind switch
            {
                DateTimeKind.Utc => dataHora,
                DateTimeKind.Local => dataHora.ToUniversalTime(),
                _ => DateTime.SpecifyKind(dataHora, DateTimeKind.Utc)
            };

            return new DateTime(utc.Year, utc.Month, utc.Day, utc.Hour, utc.Minute, 0, DateTimeKind.Utc);
        }

        private static long SlotKey(DateTime dataHora)
        {
            return NormalizarDataHoraSlot(dataHora).Ticks;
        }

        private static void AddSlotsPeriodo(HashSet<DateTime> slots, DateTime inicio, DateTime fim, TimeSpan duracao)
        {
            var atual = inicio;
            while (atual.Add(duracao) <= fim)
            {
                if (atual >= DateTime.UtcNow)
                    slots.Add(DateTime.SpecifyKind(atual, DateTimeKind.Utc));
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
