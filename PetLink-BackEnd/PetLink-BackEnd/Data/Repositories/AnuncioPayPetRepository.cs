using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Repositories;

public class AnuncioPayPetRepository : GenericRepository<AnuncioPayPet>, IAnuncioPayPetRepository
{
    private readonly AppDbContext _context;

    public AnuncioPayPetRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }
}
