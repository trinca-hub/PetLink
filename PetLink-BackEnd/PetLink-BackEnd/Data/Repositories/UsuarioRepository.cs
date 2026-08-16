using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data.Builders;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Security;

namespace PetLink_BackEnd.Data.Repositories
{
    public class UsuarioRepository : GenericRepository<Usuario>, IUsuarioRepository
    {
        private readonly AppDbContext _context;

        public UsuarioRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Usuario> Login(Login login)
        {
            var email = login.Email.Trim().ToLowerInvariant();
            var usuario = await _context.Usuarios
                .AsNoTracking()
                .FirstOrDefaultAsync(item => item.Email.ToLower() == email);
            return usuario is not null && PasswordSecurity.Verify(login.Password, usuario.Senha) ? usuario : null;
        }

        public async Task<Usuario> GetByEmail(string email)
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            return await _context.Usuarios
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        }

    }
}
