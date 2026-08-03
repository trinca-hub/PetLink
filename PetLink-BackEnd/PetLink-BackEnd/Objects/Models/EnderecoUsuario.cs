using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("enderecousuario")]
    public class EnderecoUsuario
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("usuarioid")]
        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; } = null!;

        [Column("apelido")]
        public string Apelido { get; set; } = string.Empty;

        [Column("destinatario")]
        public string Destinatario { get; set; } = string.Empty;

        [Column("telefone")]
        public string Telefone { get; set; } = string.Empty;

        [Column("cep")]
        public string Cep { get; set; } = string.Empty;

        [Column("uf")]
        public string Uf { get; set; } = string.Empty;

        [Column("cidade")]
        public string Cidade { get; set; } = string.Empty;

        [Column("bairro")]
        public string Bairro { get; set; } = string.Empty;

        [Column("rua")]
        public string Rua { get; set; } = string.Empty;

        [Column("numero")]
        public int Numero { get; set; }

        [Column("complemento")]
        public string Complemento { get; set; } = string.Empty;

        [Column("referencia")]
        public string Referencia { get; set; } = string.Empty;

        [Column("principal")]
        public bool Principal { get; set; }

        [Column("ativo")]
        public bool Ativo { get; set; } = true;

        [Column("criadoem")]
        public DateTime CriadoEm { get; set; } = DateTime.UtcNow;
    }
}
