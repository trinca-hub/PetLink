using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("anuncio_petinder")]
    public class AnuncioPeTinder
    {
        [Column("anuncioid")]
        public int AnuncioId { get; set; }
        public Anuncio Anuncio { get; set; } = null!;

        [Column("petid")]
        public int PetId { get; set; }
        public Pet Pet { get; set; } = null!;

        public AnuncioPeTinder() { }

        public AnuncioPeTinder(int anuncioId, int petId)
        {
            AnuncioId = anuncioId;
            PetId = petId;
        }
    }
}
