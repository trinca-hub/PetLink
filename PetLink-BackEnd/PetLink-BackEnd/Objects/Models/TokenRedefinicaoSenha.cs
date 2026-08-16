using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models;

[Table("token_redefinicao_senha")]
public class TokenRedefinicaoSenha
{
    [Column("id")]
    public int Id { get; set; }

    [Column("usuario_id")]
    public int UsuarioId { get; set; }

    [Column("token_hash")]
    public string TokenHash { get; set; } = string.Empty;

    [Column("expira_em")]
    public DateTime ExpiraEm { get; set; }

    [Column("usado_em")]
    public DateTime? UsadoEm { get; set; }

    public Usuario Usuario { get; set; } = null!;
}
