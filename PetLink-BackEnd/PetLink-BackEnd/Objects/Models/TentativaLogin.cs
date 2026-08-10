using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models;

[Table("tentativa_login")]
public class TentativaLogin
{
    [Column("id")]
    public int Id { get; set; }

    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("ip")]
    public string Ip { get; set; } = string.Empty;

    [Column("falhas")]
    public int Falhas { get; set; }

    [Column("bloqueado_ate")]
    public DateTime? BloqueadoAte { get; set; }

    [Column("atualizado_em")]
    public DateTime AtualizadoEm { get; set; }
}
