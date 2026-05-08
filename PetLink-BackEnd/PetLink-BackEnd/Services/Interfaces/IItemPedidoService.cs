using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Services.Interfaces
{
    public interface IItemPedidoService : IGenericService<ItemPedido, ItemPedidoDTO>
    {
        Task<IEnumerable<ItemPedidoDTO>> GetByPedidoId(int pedidoId);
        Task RemoveWithRestock(int id);
    }
}
