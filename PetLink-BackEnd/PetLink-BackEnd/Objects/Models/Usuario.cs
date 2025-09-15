using System.ComponentModel.DataAnnotations.Schema;
using System.Numerics;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("usuario")]
    public class Usuario
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nome")]
        public string Nome { get; set; }

        [Column("telefone")]
        public long telefone { get; set; }

        [Column("descricao")]
        public string Descricao { get; set; }

        [Column("quantidade")]
        public int Quantidade { get; set; }

        public Usuario() { }

        public Usuario(int id, string nome, float preco, string descricao, int quantidade)
        {
            Id = id;
            Nome = nome;
            Preco = preco;
            Descricao = descricao;
            Quantidade = quantidade;
        }
    }
}
