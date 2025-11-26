using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data.Builders;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Models;

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
            return await _context.Usuarios.AsNoTracking().FirstOrDefaultAsync(p => p.Email == login.Email && p.Senha == login.Password);
        }
    }
}
