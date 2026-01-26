using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Repositories;

public class AnuncioPetFinderRepository : GenericRepository<AnuncioPetFinder>, IAnuncioPetFinderRepository
{
    private readonly AppDbContext _context;

    public AnuncioPetFinderRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }
}
