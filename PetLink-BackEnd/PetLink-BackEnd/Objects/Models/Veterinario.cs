using System.ComponentModel.DataAnnotations.Schema;
using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Objects.Models;

[Table("veterinario")]
public class Veterinario
{
    [Column("id")]
    public int Id { get; set; }

    [Column("nome")]
    public string Nome { get; set; }

    [Column("crmv")]
    public string Crmv { get; set; }

    [Column("salario")]
    public float Salario { get; set; }

    [Column("email")]
    public string Email { get; set; }

    [Column("status")]
    public Status Status { get; set; }

    public Veterinario() { }

    public Veterinario(int id, string nome, string crmv, float salario, string email, Status status)
    {
        Id = id;
        Nome = nome;
        Crmv = crmv;
        Salario = salario;
        Email = email;
        Status = status;
    }
}
