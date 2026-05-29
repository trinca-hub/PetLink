using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Data.Repositories;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Repositories
{
    public class AgendaVeterinarioRepository : GenericRepository<AgendaVeterinario>, IAgendaVeterinarioRepository
    {
        private readonly AppDbContext _context;

        public AgendaVeterinarioRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<AgendaVeterinario?> GetByVeterinarioId(int veterinarioId)
        {
            return await _context.Set<AgendaVeterinario>()
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.VeterinarioId == veterinarioId);
        }
    }
}
