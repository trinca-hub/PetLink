using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Interafces
{
    public interface IPedidoRepository : IGenericRepository<Pedido>
    {
        Task<IEnumerable<Pedido>> GetByUsuarioId(int usuarioId);
    }
}
