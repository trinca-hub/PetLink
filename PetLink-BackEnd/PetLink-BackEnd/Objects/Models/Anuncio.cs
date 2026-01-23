using System.ComponentModel.DataAnnotations.Schema;
using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("anuncio")]
    public class Anuncio
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("descricao")]
        public string Descricao { get; set; } = string.Empty;

        [Column("tipoanuncio")]
        public TipoAnuncio TipoAnuncio { get; set; }

        [Column("datacriacao")]
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

        // FK: 1 usuário -> N anúncios
        [Column("usuarioid")]
        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; } = null!;

        public Anuncio() { }

        public Anuncio(int id, string descricao, TipoAnuncio tipoAnuncio, int usuarioId)
        {
            Id = id;
            Descricao = descricao;
            TipoAnuncio = tipoAnuncio;
            UsuarioId = usuarioId;
            DataCriacao = DateTime.UtcNow;
        }
    }
}
