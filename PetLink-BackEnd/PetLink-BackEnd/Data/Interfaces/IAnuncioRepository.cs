using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Interfaces;

public interface IAnuncioRepository : IGenericRepository<Anuncio>
{
    // (Opcional depois) Task<IEnumerable<Anuncio>> GetWithUsuario();
}
