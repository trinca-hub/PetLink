using PetLink_BackEnd.Data.Builders;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace PetLink_BackEnd.Data.Repositories
{
    public class VeterinarioRepository : GenericRepository<Veterinario>, IVeterinarioRepository
    {
        private readonly AppDbContext _context;

        public VeterinarioRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Veterinario> Login(Login login)
        {
            return await _context.Veterinarios.AsNoTracking().FirstOrDefaultAsync(p => p.Email == login.Email && p.Senha == login.Password);
        }

        public async Task<Veterinario> GetByEmail(string email)
        {
            return await _context.Veterinarios
                .FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
