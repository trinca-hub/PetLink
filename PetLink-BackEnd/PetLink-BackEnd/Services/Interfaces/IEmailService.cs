namespace PetLink_BackEnd.Services.Interfaces;

public interface IEmailService
{
    Task EnviarRedefinicaoSenha(string destinatario, string linkRedefinicao);
}
