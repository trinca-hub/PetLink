using PetLink_BackEnd.Data.Builders;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Data.Repositories
{
    public class ServicoRepository : GenericRepository<Servico>, IServicoRepository
    {
        private readonly AppDbContext _context;

        public ServicoRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
