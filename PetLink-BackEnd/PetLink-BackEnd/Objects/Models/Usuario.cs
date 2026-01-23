using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("usuario")]
    public class Usuario
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nome")]
        public string Nome { get; set; } = string.Empty;

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

        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Column("senha")]
        public string Senha { get; set; } = string.Empty;

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
