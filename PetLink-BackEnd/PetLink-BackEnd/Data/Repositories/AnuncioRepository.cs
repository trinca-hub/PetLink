using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Repositories;

public class AnuncioRepository : GenericRepository<Anuncio>, IAnuncioRepository
{
    private readonly AppDbContext _context;

    public AnuncioRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }
}
