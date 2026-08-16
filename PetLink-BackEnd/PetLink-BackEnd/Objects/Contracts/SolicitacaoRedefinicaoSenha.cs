using System.ComponentModel.DataAnnotations;

namespace PetLink_BackEnd.Objects.Contracts;

public class SolicitacaoRedefinicaoSenha
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;
}
