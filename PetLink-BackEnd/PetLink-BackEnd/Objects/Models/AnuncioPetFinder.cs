using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("anuncio_petfinder")]
    public class AnuncioPetFinder
    {
        [Column("anuncioid")]
        public int AnuncioId { get; set; }
        public Anuncio Anuncio { get; set; } = null!;

        [Column("petid")]
        public int PetId { get; set; }
        public Pet Pet { get; set; } = null!;

        [Column("ultimolocalvisto")]
        public string UltimoLocalVisto { get; set; } = string.Empty;

        [Column("datadesaparecimento")]
        public DateTime DataDesaparecimento { get; set; }

        public AnuncioPetFinder() { }

        public AnuncioPetFinder(int anuncioId, int petId, string ultimoLocalVisto, DateTime dataDesaparecimento)
        {
            AnuncioId = anuncioId;
            PetId = petId;
            UltimoLocalVisto = ultimoLocalVisto;
            DataDesaparecimento = dataDesaparecimento;
        }
    }
}
