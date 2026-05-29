using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("agendamentoconsulta")]
    public class AgendamentoConsulta
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("veterinarioid")]
        public int VeterinarioId { get; set; }
        public Veterinario Veterinario { get; set; } = null!;

        [Column("petid")]
        public int PetId { get; set; }
        public Pet Pet { get; set; } = null!;

        [Column("usuarioid")]
        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; } = null!;

        [Column("datahorainicio")]
        public DateTime? DataHoraInicio { get; set; }

        [Column("datahorafim")]
        public DateTime? DataHoraFim { get; set; }

        [Column("status")]
        public StatusAgendamento Status { get; set; }

        [Column("tiposervico")]
        public TipoServico TipoServico { get; set; }

        [Column("observacao")]
        public string? Observacao { get; set; }

        [Column("motivocancelamento")]
        public string? MotivoCancelamento { get; set; }

        [Column("datacriacao")]
        public DateTime DataCriacao { get; set; }

        [Column("dataconfirmacao")]
        public DateTime? DataConfirmacao { get; set; }

        [Column("datacancelamento")]
        public DateTime? DataCancelamento { get; set; }

        [Timestamp]
        [Column("rowversion")]
        public byte[] RowVersion { get; set; } = Array.Empty<byte>();

        public AgendamentoConsulta() { }

        public AgendamentoConsulta(int id, int veterinarioId, int petId, int usuarioId, DateTime dataHoraInicio, DateTime dataHoraFim, StatusAgendamento status, TipoServico tipoServico, string? observacao, string? motivoCancelamento, DateTime dataCriacao, DateTime? dataConfirmacao, DateTime? dataCancelamento)
        {
            Id = id;
            VeterinarioId = veterinarioId;
            PetId = petId;
            UsuarioId = usuarioId;
            DataHoraInicio = dataHoraInicio;
            DataHoraFim = dataHoraFim;
            Status = status;
            TipoServico = tipoServico;
            Observacao = observacao;
            MotivoCancelamento = motivoCancelamento;
            DataCriacao = dataCriacao;
            DataConfirmacao = dataConfirmacao;
            DataCancelamento = dataCancelamento;
        }
    }
}
