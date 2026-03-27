using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Contracts;

namespace PetLink_BackEnd.Services.Interfaces
{
    public interface IUsuarioService : IGenericService<Usuario, UsuarioDTO>
    {
        Task<UsuarioDTO> Login(Login login);
        Task<UsuarioDTO> GetByEmail(string email);

    }
}
