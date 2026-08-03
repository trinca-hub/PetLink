using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Objects.Dtos.Entities.AgendamentoConsulta
{
    public class CriarSolicitacaoConsultaDTO
    {
        public int VeterinarioId { get; set; }
        public int PetId { get; set; }
        public TipoServico TipoServico { get; set; }
        public DateTime? DataHoraInicio { get; set; }
        public string? Observacao { get; set; }
    }
}
