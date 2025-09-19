using PetLink_BackEnd.Objects.Enums;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("pedido")]
    public class Pedido
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("usuarioid")]
        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; } = null!;

        [Column("datapedido")]
        public DateTime DataPedido { get; set; }

        public Pedido() { }

        public Pedido(int id, int usuarioid, DateTime datapedido)
        {
            Id = id;
            UsuarioId = usuarioid;
            DataPedido = datapedido;
        }
    }
}