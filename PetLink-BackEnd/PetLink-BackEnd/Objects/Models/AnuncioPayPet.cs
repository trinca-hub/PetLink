using System.ComponentModel.DataAnnotations.Schema;
using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("anuncio_paypet")]
    public class AnuncioPayPet
    {
        [Column("anuncioid")]
        public int AnuncioId { get; set; }
        public Anuncio Anuncio { get; set; } = null!;

        [Column("petid")]
        public int PetId { get; set; }
        public Pet Pet { get; set; } = null!;

        [Column("tipopaypet")]
        public TipoPayPet TipoPayPet { get; set; }

        [Column("valor")]
        public decimal? Valor { get; set; }

        public AnuncioPayPet() { }

        public AnuncioPayPet(int anuncioId, int petId, TipoPayPet tipoPayPet, decimal? valor)
        {
            AnuncioId = anuncioId;
            PetId = petId;
            TipoPayPet = tipoPayPet;
            Valor = valor;
        }

    }

}
