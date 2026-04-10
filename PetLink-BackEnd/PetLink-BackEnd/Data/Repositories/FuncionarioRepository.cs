using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Models;

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
            return await _context.Funcionarios.AsNoTracking().FirstOrDefaultAsync(p => p.Email == login.Email && p.Senha == login.Password);
        }

        public async Task<Funcionario> GetByEmail(string email)
        {
            return await _context.Funcionarios
                .FirstOrDefaultAsync(u => u.Email == email);
        }
    }
}
