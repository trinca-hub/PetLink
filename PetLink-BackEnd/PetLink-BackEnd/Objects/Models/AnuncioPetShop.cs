using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("anuncio_petshop")]
    public class AnuncioPetShop
    {
        [Column("anuncioid")]
        public int AnuncioId { get; set; }
        public Anuncio Anuncio { get; set; } = null!;

        [Column("produtoid")]
        public int ProdutoId { get; set; }
        public Produto Produto { get; set; } = null!;

        [Column("petshopid")]
        public int PetShopId { get; set; }

    }

}
