using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Services.Interfaces
{
    public interface IAdministradorService : IGenericService<Administrador, AdministradorDTO>
    {
        Task<AdministradorDTO> Login(Login login);
        Task<AdministradorDTO> GetByEmail(string email);
    }
}
