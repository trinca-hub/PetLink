using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("produto")]
    public class Produto
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nome")]
        public string Nome { get; set; }

        [Column("preco")]
        public float Preco { get; set; }

        [Column("descricao")]
        public string Descricao { get; set; }

        [Column("quantidade")]
        public int Quantidade { get; set; }

        [Column("foto")]
        public string? Foto { get; set; }


        public Produto() { }

        public Produto(int id, string nome, float preco, string descricao, int quantidade, string foto)
        {
            Id = id;
            Nome = nome;
            Preco = preco;
            Descricao = descricao;
            Quantidade = quantidade;
            Foto = foto;
        }
    }
}