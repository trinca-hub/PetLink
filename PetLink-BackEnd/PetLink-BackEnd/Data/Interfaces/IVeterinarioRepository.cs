using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Objects.Contracts;

namespace PetLink_BackEnd.Data.Interafces
{
    public interface IVeterinarioRepository : IGenericRepository<Veterinario>
    {
        Task<Veterinario> Login(Login login);

        Task<Veterinario> GetByEmail(string email);

    }
}
