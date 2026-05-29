using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Objects.Dtos.Entities.AgendaVeterinario
{
    public class AgendaDTO
    {
        public int Id { get; set; }
        public int VeterinarioId { get; set; }
        public DiasSemana DiasSemanaAtivos { get; set; }
        public TimeSpan HoraInicioManha { get; set; }
        public TimeSpan HoraFimManha { get; set; }
        public TimeSpan HoraInicioTarde { get; set; }
        public TimeSpan HoraFimTarde { get; set; }
        public int DuracaoMinutos { get; set; }
        public DateTime DataCriacao { get; set; }
    }
}
