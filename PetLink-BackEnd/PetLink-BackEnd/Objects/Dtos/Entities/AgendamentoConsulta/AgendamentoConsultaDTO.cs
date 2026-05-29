using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Objects.Dtos.Entities.AgendamentoConsulta
{
    public class AgendamentoConsultaDTO
    {
        public int Id { get; set; }
        public int VeterinarioId { get; set; }
        public int PetId { get; set; }
        public int UsuarioId { get; set; }
        public DateTime? DataHoraInicio { get; set; }
        public DateTime? DataHoraFim { get; set; }
        public StatusAgendamento Status { get; set; }
        public TipoServico TipoServico { get; set; }
        public string? Observacao { get; set; }
        public string? MotivoCancelamento { get; set; }
        public DateTime DataCriacao { get; set; }
        public DateTime? DataConfirmacao { get; set; }
        public DateTime? DataCancelamento { get; set; }
    }
}
