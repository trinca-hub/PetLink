using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Models;
using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Security;

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
            var email = login.Email.Trim().ToLowerInvariant();
            var conta = await _context.Administradores.AsNoTracking().FirstOrDefaultAsync(p => p.Email.ToLower() == email);
            return conta is not null && PasswordSecurity.Verify(login.Password, conta.Senha) ? conta : null;
        }

        public async Task<Administrador> GetByEmail(string email)
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            return await _context.Administradores
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        }
    }
}
