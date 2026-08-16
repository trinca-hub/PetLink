using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Services.Interfaces
{
    public interface IFuncionarioService : IGenericService<Funcionario, FuncionarioDTO>
    {
        Task<FuncionarioDTO> Login(Login login);
        Task<FuncionarioDTO> GetByEmail(string email);
    }
}
