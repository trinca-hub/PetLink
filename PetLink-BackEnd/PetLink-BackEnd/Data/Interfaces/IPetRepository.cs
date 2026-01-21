using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Interfaces;

public interface IPetRepository : IGenericRepository<Pet>
{
    Task<IEnumerable<Pet>> GetByUsuarioId(int usuarioId);
<<<<<<< HEAD

=======
>>>>>>> b6aa95b71cc22555ce2741ae2f58d1ab25962415
}
