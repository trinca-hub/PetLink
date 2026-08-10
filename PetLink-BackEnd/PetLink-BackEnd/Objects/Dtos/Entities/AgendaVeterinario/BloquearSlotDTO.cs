namespace PetLink_BackEnd.Objects.Dtos.Entities.AgendaVeterinario
{
    public class BloquearSlotDTO
    {
        public int VeterinarioId { get; set; }
        public DateTime DataHoraInicio { get; set; }
        public string? Motivo { get; set; }
    }
}
