using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models;

[Table("token_redefinicao_senha_gestao")]
public class TokenRedefinicaoSenhaGestao
{
    [Column("id")] public int Id { get; set; }
    [Column("perfil")] public string Perfil { get; set; } = string.Empty;
    [Column("email")] public string Email { get; set; } = string.Empty;
    [Column("token_hash")] public string TokenHash { get; set; } = string.Empty;
    [Column("expira_em")] public DateTime ExpiraEm { get; set; }
    [Column("usado_em")] public DateTime? UsadoEm { get; set; }
}
