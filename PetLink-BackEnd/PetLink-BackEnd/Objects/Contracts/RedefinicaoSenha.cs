using System.ComponentModel.DataAnnotations;

namespace PetLink_BackEnd.Objects.Contracts;

public class RedefinicaoSenha
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Token { get; set; } = string.Empty;

    [Required, MinLength(8)]
    public string NovaSenha { get; set; } = string.Empty;
}
