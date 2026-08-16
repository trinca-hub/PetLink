using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Security;

namespace PetLink_BackEnd.Data.Repositories
{
    public class FuncionarioRepository : GenericRepository<Funcionario>, IFuncionarioRepository
    {
        private readonly AppDbContext _context;

        public FuncionarioRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<Funcionario> Login(Login login)
        {
            var email = login.Email.Trim().ToLowerInvariant();
            var conta = await _context.Funcionarios.AsNoTracking().FirstOrDefaultAsync(p => p.Email.ToLower() == email);
            return conta is not null && PasswordSecurity.Verify(login.Password, conta.Senha) ? conta : null;
        }

        public async Task<Funcionario> GetByEmail(string email)
        {
            var normalizedEmail = email.Trim().ToLowerInvariant();
            return await _context.Funcionarios
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        }
    }
}
