using PetLink_BackEnd.Data;
using PetLink_BackEnd.Data.Repositories;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.WebAPI.Data.Repositories;

public class PetRepository : GenericRepository<Pet>, IPetRepository
{
    private readonly AppDbContext _context;

    public PetRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }
}