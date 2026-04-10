using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Models;
using Microsoft.EntityFrameworkCore;

namespace PetLink_BackEnd.Data.Repositories
{
    public class AdministradorRepository :GenericRepository<Administrador>, IAdministradorRepository
    {
        private readonly AppDbContext _context;

        public AdministradorRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Administrador> Login(Login login)
        {
            return await _context.Administradores.AsNoTracking().FirstOrDefaultAsync(p => p.Email == login.Email && p.Senha == login.Password);
        }

        public async Task<Administrador> GetByEmail(string email)
        {
            return await _context.Administradores
                .FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
