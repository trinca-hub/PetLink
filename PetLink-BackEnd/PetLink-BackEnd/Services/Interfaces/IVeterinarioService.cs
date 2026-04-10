using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Contracts;

namespace PetLink_BackEnd.Services.Interfaces
{
    public interface IVeterinarioService : IGenericService<Veterinario, VeterinarioDTO>
    {
        Task<VeterinarioDTO> Login(Login login);
        Task<VeterinarioDTO> GetByEmail(string email);

    }
}
