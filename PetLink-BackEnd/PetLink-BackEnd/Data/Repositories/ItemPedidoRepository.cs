using PetLink_BackEnd.Data.Builders;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Repositories
{
    public class ItemPedidoRepository : GenericRepository<ItemPedido>, IItemPedidoRepository
    {
        private readonly AppDbContext _context;

        public ItemPedidoRepository(AppDbContext context) : base(context)
        {
            _context = context;
        }
    }
}
