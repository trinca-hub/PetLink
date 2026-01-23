using System.ComponentModel.DataAnnotations.Schema;
using PetLink_BackEnd.Objects.Enums;
using System;

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

        // ✅ Novo: quem criou
        [Column("criadortipo")]
        public CriadorAnuncio CriadorTipo { get; set; }

        [Column("criadorid")]
        public int CriadorId { get; set; }

        // ✅ Novo: de onde vem endereço (você já tem o enum)
        [Column("origemendereco")]
        public OrigemEndereco OrigemEndereco { get; set; }

        // ✅ UsuarioId vira opcional (só quando for anúncio de usuário)
        [Column("usuarioid")]
        public int? UsuarioId { get; set; }
        public Usuario? Usuario { get; set; }

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
