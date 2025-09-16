using System.ComponentModel.DataAnnotations.Schema;
using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("administrador")]
    public class Administrador
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nome")]
        public string Nome { get; set; }

        [Column("email")]
        public string Email { get; set; }

        [Column("senha")]
        public string Senha { get; set; }

        [Column("status")]
        public Status Status { get; set; }

        public Administrador() { }

        public Administrador(int id, string nome, string email, string senha, Status status)
        {
            Id = id;
            Nome = nome;
            Email = email;
            Senha = senha;
            Status = status;
        }
    }
}

