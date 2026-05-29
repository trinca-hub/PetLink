using System.ComponentModel.DataAnnotations.Schema;
using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("agendaveterinario")]
    public class AgendaVeterinario
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("veterinarioid")]
        public int VeterinarioId { get; set; }
        public Veterinario Veterinario { get; set; } = null!;

        [Column("diassemanaativos")]
        public DiasSemana DiasSemanaAtivos { get; set; }

        [Column("horainiciomanha")]
        public TimeSpan HoraInicioManha { get; set; }

        [Column("horafimmanha")]
        public TimeSpan HoraFimManha { get; set; }

        [Column("horainiciotarde")]
        public TimeSpan HoraInicioTarde { get; set; }

        [Column("horafimtarde")]
        public TimeSpan HoraFimTarde { get; set; }

        [Column("duracaominutos")]
        public int DuracaoMinutos { get; set; }

        [Column("datacriacao")]
        public DateTime DataCriacao { get; set; }

        public AgendaVeterinario() { }

        public AgendaVeterinario(int id, int veterinarioId, DiasSemana diasSemanaAtivos, TimeSpan horaInicioManha, TimeSpan horaFimManha, TimeSpan horaInicioTarde, TimeSpan horaFimTarde, int duracaoMinutos, DateTime dataCriacao)
        {
            Id = id;
            VeterinarioId = veterinarioId;
            DiasSemanaAtivos = diasSemanaAtivos;
            HoraInicioManha = horaInicioManha;
            HoraFimManha = horaFimManha;
            HoraInicioTarde = horaInicioTarde;
            HoraFimTarde = horaFimTarde;
            DuracaoMinutos = duracaoMinutos;
            DataCriacao = dataCriacao;
        }
    }
}
