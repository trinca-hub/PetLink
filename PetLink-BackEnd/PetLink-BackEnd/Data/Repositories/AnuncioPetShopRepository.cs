using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Repositories;

public class AnuncioPetShopRepository : GenericRepository<AnuncioPetShop>, IAnuncioPetShopRepository
{
    private readonly AppDbContext _context;

    public AnuncioPetShopRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }
}
