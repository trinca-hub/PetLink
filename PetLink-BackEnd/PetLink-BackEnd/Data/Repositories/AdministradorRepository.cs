using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Repositories
{
    public class AdministradorRepository :GenericRepository<Administrador>, IAdministradorRepository
    {
        private readonly AppDbContext _context;

        public AdministradorRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
