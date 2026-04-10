using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Interafces
{
    public interface IFuncionarioRepository : IGenericRepository<Funcionario>
    {
        Task<Funcionario> Login(Login login);

        Task<Funcionario> GetByEmail(string email);
    }
}
