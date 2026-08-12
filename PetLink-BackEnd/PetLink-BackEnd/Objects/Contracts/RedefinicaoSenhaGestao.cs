using System.ComponentModel.DataAnnotations;

namespace PetLink_BackEnd.Objects.Contracts;

public class RedefinicaoSenhaGestao : SolicitacaoRedefinicaoSenhaGestao
{
    [Required] public string Token { get; set; } = string.Empty;
    [Required] public string NovaSenha { get; set; } = string.Empty;
}
