using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;
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
        public string Telefone { get; set; }

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

        public Usuario() { }

        public Usuario(int id, string nome, string telefone, string cep, string uf, string cidade, string bairro, string rua, int numero, string email, string senha)
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
