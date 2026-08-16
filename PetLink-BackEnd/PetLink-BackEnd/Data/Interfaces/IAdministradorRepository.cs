using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Interfaces
{
    public interface IAdministradorRepository : IGenericRepository<Administrador>
    {
        Task<Administrador> Login(Login login);

        Task<Administrador> GetByEmail(string email);
    }
}
