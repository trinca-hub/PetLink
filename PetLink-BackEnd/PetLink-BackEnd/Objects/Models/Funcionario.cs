using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("funcionario")]
    public class Funcionario
    {
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [Column("nome")]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("senha")]
        public string Senha { get; set; } = string.Empty;

        [Required]
        [Column("salario")]
        public decimal Salario { get; set; }

        public Funcionario() { }

        public Funcionario(int id, string nome, string email, string senha, decimal salario)
        {
            Id = id;
            Nome = nome;
            Email = email;
            Senha = senha;
            Salario = salario;
        }
    }
}
