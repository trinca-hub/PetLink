using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Interafces
{
    public interface IItemPedidoRepository : IGenericRepository<ItemPedido>
    {
        Task<IEnumerable<ItemPedido>> GetByPedidoId(int pedidoId);
    }
}
