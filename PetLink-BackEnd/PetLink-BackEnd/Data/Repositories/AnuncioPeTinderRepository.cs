using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Repositories;

public class AnuncioPeTinderRepository : GenericRepository<AnuncioPeTinder>, IAnuncioPeTinderRepository
{
    private readonly AppDbContext _context;

    public AnuncioPeTinderRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }
}
