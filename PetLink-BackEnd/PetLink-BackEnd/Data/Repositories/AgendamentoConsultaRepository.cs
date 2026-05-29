using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Data.Repositories;
using PetLink_BackEnd.Objects.Enums;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Repositories
{
    public class AgendamentoConsultaRepository : GenericRepository<AgendamentoConsulta>, IAgendamentoConsultaRepository
    {
        private readonly AppDbContext _context;

        public AgendamentoConsultaRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AgendamentoConsulta>> GetByUsuarioId(int usuarioId)
        {
            return await _context.Set<AgendamentoConsulta>()
                .AsNoTracking()
                .Where(a => a.UsuarioId == usuarioId)
                .OrderByDescending(a => a.DataCriacao)
                .ToListAsync();
        }

        public async Task<IEnumerable<AgendamentoConsulta>> GetByVeterinarioId(int veterinarioId)
        {
            return await _context.Set<AgendamentoConsulta>()
                .AsNoTracking()
                .Where(a => a.VeterinarioId == veterinarioId)
                .OrderByDescending(a => a.DataCriacao)
                .ToListAsync();
        }

        public async Task<IEnumerable<AgendamentoConsulta>> GetConfirmadosPorVeterinario(int veterinarioId, DateTime inicio, DateTime fim)
        {
            return await _context.Set<AgendamentoConsulta>()
                .AsNoTracking()
                .Where(a => a.VeterinarioId == veterinarioId
                    && a.Status == StatusAgendamento.Confirmado
                    && a.DataHoraInicio >= inicio
                    && a.DataHoraInicio < fim)
                .ToListAsync();
        }

        public async Task<bool> ExistsConfirmadoConflito(int veterinarioId, DateTime inicio, DateTime fim, int? ignorarId)
        {
            var query = _context.Set<AgendamentoConsulta>()
                .AsNoTracking()
                .Where(a => a.VeterinarioId == veterinarioId && a.Status == StatusAgendamento.Confirmado);

            if (ignorarId.HasValue)
            {
                query = query.Where(a => a.Id != ignorarId.Value);
            }

            return await query.AnyAsync(a => inicio < a.DataHoraFim && fim > a.DataHoraInicio);
        }

        public async Task<bool> ExistsPendenteDuplicado(int veterinarioId, int petId, int usuarioId)
        {
            return await _context.Set<AgendamentoConsulta>()
                .AsNoTracking()
                .AnyAsync(a => a.VeterinarioId == veterinarioId
                    && a.PetId == petId
                    && a.UsuarioId == usuarioId
                    && a.Status == StatusAgendamento.Pendente);
        }

        public async Task<AgendamentoConsulta?> GetWithRelations(int id)
        {
            return await _context.Set<AgendamentoConsulta>()
                .Include(a => a.Veterinario)
                .Include(a => a.Pet)
                .Include(a => a.Usuario)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<AgendamentoConsulta?> GetByIdForUpdate(int id)
        {
            return await _context.Set<AgendamentoConsulta>()
                .FirstOrDefaultAsync(a => a.Id == id);
        }
    }
}
