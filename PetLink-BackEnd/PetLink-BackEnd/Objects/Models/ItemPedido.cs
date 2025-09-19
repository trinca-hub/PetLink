using PetLink_BackEnd.Objects.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("itempedido")]
    public class ItemPedido
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("pedidoid")]
        public int PedidoId { get; set; }
        public Pedido Pedido { get; set; } = null!;

        [Column("produtoid")]
        public int ProdutoId { get; set; }
        public Produto Produto { get; set; } = null!;

        [Column("quantidade")]
        public int Quantidade { get; set; }

        public ItemPedido() { }

        public ItemPedido(int id, int pedidoid, int produtoid, int quantidade)
        {
            Id = id;
            PedidoId = pedidoid;
            ProdutoId = produtoid;
            Quantidade = quantidade;
        }
    }
}