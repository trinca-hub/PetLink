using System.ComponentModel.DataAnnotations;

namespace PetLink_BackEnd.Objects.Contracts;

public class SolicitacaoRedefinicaoSenhaGestao
{
    [Required] public string Perfil { get; set; } = string.Empty;
    [Required, EmailAddress] public string Email { get; set; } = string.Empty;
}
