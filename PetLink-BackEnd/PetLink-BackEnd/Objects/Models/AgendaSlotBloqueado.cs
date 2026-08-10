using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("agendaslotbloqueado")]
    public class AgendaSlotBloqueado
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("veterinarioid")]
        public int VeterinarioId { get; set; }
        public Veterinario Veterinario { get; set; } = null!;

        [Column("datahorainicio")]
        public DateTime DataHoraInicio { get; set; }

        [Column("motivo")]
        public string? Motivo { get; set; }

        [Column("datacriacao")]
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;
    }
}
