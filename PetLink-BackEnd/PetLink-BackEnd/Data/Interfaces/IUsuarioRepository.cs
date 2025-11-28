using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Interafces
{
    public interface IUsuarioRepository : IGenericRepository<Usuario>
    {
        Task<Usuario> Login(Login login);
    }
}
