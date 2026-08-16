using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Dtos.Entities.AgendaVeterinario;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Objects.Enums;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities
{
    public class AgendaVeterinarioService : IAgendaVeterinarioService
    {
        private readonly IAgendaVeterinarioRepository _agendaRepository;
        private readonly IAgendamentoConsultaRepository _agendamentoRepository;
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public AgendaVeterinarioService(IAgendaVeterinarioRepository agendaRepository, IAgendamentoConsultaRepository agendamentoRepository, AppDbContext context, IMapper mapper)
        {
            _agendaRepository = agendaRepository;
            _agendamentoRepository = agendamentoRepository;
            _context = context;
            _mapper = mapper;
        }

        public async Task<AgendaDTO> CriarAgenda(CriarAgendaDTO dto, int? veterinarioId)
        {
            var vetId = veterinarioId ?? dto.VeterinarioId;
            if (vetId <= 0)
                throw new InvalidOperationException("Veterinário inválido.");

            if (dto.DiasSemanaAtivos == DiasSemana.Nenhum)
                throw new InvalidOperationException("É necessário informar ao menos um dia ativo.");

            ValidarRegrasAgenda(dto.HoraInicioManha, dto.HoraFimManha, dto.HoraInicioTarde, dto.HoraFimTarde, dto.DuracaoMinutos);

            var existente = await _agendaRepository.GetByVeterinarioId(vetId);
            if (existente != null)
                throw new InvalidOperationException("Agenda já cadastrada para este veterinário.");

            var agenda = new AgendaVeterinario
            {
                VeterinarioId = vetId,
                DiasSemanaAtivos = dto.DiasSemanaAtivos,
                HoraInicioManha = dto.HoraInicioManha,
                HoraFimManha = dto.HoraFimManha,
                HoraInicioTarde = dto.HoraInicioTarde,
                HoraFimTarde = dto.HoraFimTarde,
                DuracaoMinutos = dto.DuracaoMinutos,
                DataCriacao = DateTime.UtcNow
            };

            await _agendaRepository.Add(agenda);
            return _mapper.Map<AgendaDTO>(agenda);
        }

        public async Task<AgendaDTO> AtualizarAgenda(int id, AtualizarAgendaDTO dto, int? veterinarioId)
        {
            var agenda = await _agendaRepository.GetById(id);
            if (agenda == null)
                return null;

            if (veterinarioId.HasValue && agenda.VeterinarioId != veterinarioId.Value)
                throw new UnauthorizedAccessException("Agenda não pertence ao veterinário autenticado.");

            ValidarRegrasAgenda(dto.HoraInicioManha, dto.HoraFimManha, dto.HoraInicioTarde, dto.HoraFimTarde, dto.DuracaoMinutos);

            agenda.DiasSemanaAtivos = dto.DiasSemanaAtivos;
            agenda.HoraInicioManha = dto.HoraInicioManha;
            agenda.HoraFimManha = dto.HoraFimManha;
            agenda.HoraInicioTarde = dto.HoraInicioTarde;
            agenda.HoraFimTarde = dto.HoraFimTarde;
            agenda.DuracaoMinutos = dto.DuracaoMinutos;

            await _agendaRepository.Update(agenda);
            return _mapper.Map<AgendaDTO>(agenda);
        }

        public async Task<AgendaDTO> BuscarAgendaVeterinario(int veterinarioId)
        {
            var agenda = await _agendaRepository.GetByVeterinarioId(veterinarioId);
            return _mapper.Map<AgendaDTO>(agenda);
        }

        public async Task<IEnumerable<SlotDisponivelDTO>> GerarSlotsDisponiveis(int veterinarioId, DateTime? dataInicio)
        {
            var agenda = await _agendaRepository.GetByVeterinarioId(veterinarioId);
            if (agenda == null)
            return Enumerable.Empty<SlotDisponivelDTO>();

            var inicio = AgendaHorarioHelper.ObterDataLocal(dataInicio);
            if (inicio < AgendaHorarioHelper.HojeLocal)
                inicio = AgendaHorarioHelper.HojeLocal;

            var slots = new List<DateTime>();
            var duracao = TimeSpan.FromMinutes(agenda.DuracaoMinutos);
            var diasAtivos = ParseDiasSemana(agenda.DiasSemanaAtivos);

            for (var i = 0; i < 7; i++)
            {
                var dia = inicio.AddDays(i);
                if (!diasAtivos.Contains(dia.DayOfWeek))
                    continue;

                var inicioManha = AgendaHorarioHelper.CriarHorarioUtc(dia, agenda.HoraInicioManha);
                var fimManha = AgendaHorarioHelper.CriarHorarioUtc(dia, agenda.HoraFimManha);
                var inicioTarde = AgendaHorarioHelper.CriarHorarioUtc(dia, agenda.HoraInicioTarde);
                var fimTarde = AgendaHorarioHelper.CriarHorarioUtc(dia, agenda.HoraFimTarde);

                AddSlotsPeriodo(slots, inicioManha, fimManha, duracao);
                AddSlotsPeriodo(slots, inicioTarde, fimTarde, duracao);
            }

            var inicioBusca = AgendaHorarioHelper.CriarHorarioUtc(inicio, TimeSpan.Zero);
            var fimBusca = AgendaHorarioHelper.CriarHorarioUtc(inicio.AddDays(7), TimeSpan.Zero);
            var bloqueados = await _context.Set<AgendaSlotBloqueado>()
                .AsNoTracking()
                .Where(b => b.VeterinarioId == veterinarioId && b.DataHoraInicio >= inicioBusca && b.DataHoraInicio < fimBusca)
                .Select(b => b.DataHoraInicio)
                .ToListAsync();

            var bloqueadosSet = new HashSet<long>(bloqueados.Select(SlotKey));

            return slots
                .Where(s => !bloqueadosSet.Contains(SlotKey(s)))
                .Select(s => new SlotDisponivelDTO
            {
                DataHoraInicio = s,
                DataHoraFim = s.Add(duracao)
            });
        }

        public async Task<IEnumerable<SlotDisponivelDTO>> GerarSlotsDisponiveisTutor(int veterinarioId, DateTime? dataInicio)
        {
            var agenda = await _agendaRepository.GetByVeterinarioId(veterinarioId);
            if (agenda == null)
                return Enumerable.Empty<SlotDisponivelDTO>();

            var inicio = AgendaHorarioHelper.ObterDataLocal(dataInicio);
            if (inicio < AgendaHorarioHelper.HojeLocal)
                inicio = AgendaHorarioHelper.HojeLocal;

            var slots = (await GerarSlotsDisponiveis(veterinarioId, inicio)).ToList();
            var inicioBusca = AgendaHorarioHelper.CriarHorarioUtc(inicio, TimeSpan.Zero);
            var fimBusca = AgendaHorarioHelper.CriarHorarioUtc(inicio.AddDays(7), TimeSpan.Zero);
            var confirmados = await _agendamentoRepository.GetConfirmadosPorVeterinario(veterinarioId, inicioBusca, fimBusca);
            var ocupados = new HashSet<long>(confirmados.Where(c => c.DataHoraInicio.HasValue)
                .Select(c => SlotKey(c.DataHoraInicio!.Value)));

            return slots.Where(s => !ocupados.Contains(SlotKey(s.DataHoraInicio)));
        }

        public async Task BloquearSlot(BloquearSlotDTO dto, int? veterinarioId)
        {
            var vetId = veterinarioId ?? dto.VeterinarioId;
            if (vetId <= 0)
                throw new InvalidOperationException("Veterinário inválido.");

            var inicio = NormalizarDataHoraSlot(dto.DataHoraInicio);
            var existe = await _context.Set<AgendaSlotBloqueado>()
                .AnyAsync(b => b.VeterinarioId == vetId && b.DataHoraInicio == inicio);

            if (existe)
                return;

            _context.Set<AgendaSlotBloqueado>().Add(new AgendaSlotBloqueado
            {
                VeterinarioId = vetId,
                DataHoraInicio = inicio,
                Motivo = dto.Motivo?.Trim(),
                DataCriacao = DateTime.UtcNow
            });

            await _context.SaveChangesAsync();
        }

        public async Task DesbloquearSlot(int veterinarioId, DateTime dataHoraInicio, int? veterinarioAutenticadoId)
        {
            var vetId = veterinarioAutenticadoId ?? veterinarioId;
            if (vetId != veterinarioId)
                throw new UnauthorizedAccessException("Agenda não pertence ao veterinário autenticado.");

            var inicio = NormalizarDataHoraSlot(dataHoraInicio);
            var bloqueio = await _context.Set<AgendaSlotBloqueado>()
                .FirstOrDefaultAsync(b => b.VeterinarioId == veterinarioId && b.DataHoraInicio == inicio);

            if (bloqueio is null)
                return;

            _context.Set<AgendaSlotBloqueado>().Remove(bloqueio);
            await _context.SaveChangesAsync();
        }

        private static DateTime NormalizarDataHoraSlot(DateTime dataHora)
        {
            return AgendaHorarioHelper.ParaUtc(dataHora);
        }

        private static long SlotKey(DateTime dataHora)
        {
            return NormalizarDataHoraSlot(dataHora).Ticks;
        }

        private static void AddSlotsPeriodo(List<DateTime> slots, DateTime inicio, DateTime fim, TimeSpan duracao)
        {
            var atual = inicio;
            while (atual.Add(duracao) <= fim)
            {
                if (atual >= DateTime.UtcNow)
                    slots.Add(atual);
                atual = atual.Add(duracao);
            }
        }

        private static void ValidarRegrasAgenda(TimeSpan inicioManha, TimeSpan fimManha, TimeSpan inicioTarde, TimeSpan fimTarde, int duracao)
        {
            if (inicioManha != AgendaHorarioHelper.InicioManha || fimManha != AgendaHorarioHelper.FimManha ||
                inicioTarde != AgendaHorarioHelper.InicioTarde || fimTarde != AgendaHorarioHelper.FimTarde)
            {
                throw new InvalidOperationException("Horários da agenda devem ser 08:00-11:00 e 13:00-17:00.");
            }

            if (duracao != 60)
            {
                throw new InvalidOperationException("Duração da consulta deve ser 60 minutos.");
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
