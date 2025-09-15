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

        [Column("telefone")]
        public float Telefone { get; set; }

        [Column("cep")]
        public string Cep { get; set; }

        [Column("uf")]
        public string Uf { get; set; }

        [Column("cidade")]
        public string Cidade { get; set; }

        [Column("bairro")]
        public string Bairro { get; set; }

        [Column("rua")]
        public string Rua { get; set; }

        [Column("numero")]
        public int Numero { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("senha")]
        public string Senha { get; set; }

        public Produto() { }

        public Produto(int id, string nome, float telefone, string cep, string uf, string cidade, string bairro,
            string rua, string numero, string email, string senha  )
        {
            Id = id;
            Nome = nome;
            Telefone = telefone;
            Cep = cep; 
            Uf = uf;
            Cidade = cidade;
            Bairro = bairro;
            Rua = rua;
            Numero = numero;
            Email = email;
            Senha = senha;

        }
    }
}
