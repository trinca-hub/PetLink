using PetLink_BackEnd.Data;
using PetLink_BackEnd.Data.Repositories;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Models;
using Microsoft.EntityFrameworkCore;
<<<<<<< HEAD

=======
>>>>>>> b6aa95b71cc22555ce2741ae2f58d1ab25962415

namespace PetLink_BackEnd.WebAPI.Data.Repositories;

public class PetRepository : GenericRepository<Pet>, IPetRepository
{
    private readonly AppDbContext _context;

    public async Task<IEnumerable<Pet>> GetByUsuarioId(int usuarioId)
{
    return await _context.Pets
        .Where(p => p.UsuarioId == usuarioId)
        .ToListAsync();
}


    public PetRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Pet>> GetByUsuarioId(int usuarioId)
    {
        return await _context.Pet
            .Where(p => p.UsuarioId == usuarioId)
            .ToListAsync();
    }
}

