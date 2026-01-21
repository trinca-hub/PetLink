using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Services.Interfaces
{
    public interface IPetService : IGenericService<Pet, PetDTO>
    {
        Task<IEnumerable<PetDTO>> GetByUsuarioId(int usuarioId);
<<<<<<< HEAD

=======
>>>>>>> b6aa95b71cc22555ce2741ae2f58d1ab25962415
    }
}
