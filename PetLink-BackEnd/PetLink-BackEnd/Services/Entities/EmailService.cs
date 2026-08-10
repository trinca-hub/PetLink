using System.Net;
using System.Net.Mail;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly IWebHostEnvironment _environment;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, IWebHostEnvironment environment, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _environment = environment;
        _logger = logger;
    }

    public async Task EnviarRedefinicaoSenha(string destinatario, string linkRedefinicao)
    {
        var host = _configuration["Smtp:Host"];
        if (string.IsNullOrWhiteSpace(host))
        {
            if (_environment.IsDevelopment())
            {
                _logger.LogInformation("Link de redefinição para {Email}: {Link}", destinatario, linkRedefinicao);
                return;
            }

            throw new InvalidOperationException("O envio de e-mail não está configurado.");
        }

        var port = int.TryParse(_configuration["Smtp:Port"], out var configuredPort) ? configuredPort : 587;
        var remetente = _configuration["Smtp:From"]
            ?? throw new InvalidOperationException("O remetente de e-mail não está configurado.");

        using var message = new MailMessage(remetente, destinatario)
        {
            Subject = "Redefinição de senha — PetLink",
            IsBodyHtml = true,
            Body = $"""
                <p>Recebemos uma solicitação para redefinir sua senha no PetLink.</p>
                <p><a href="{linkRedefinicao}">Criar uma nova senha</a></p>
                <p>Se o botão não abrir o aplicativo, copie e cole este código na tela de redefinição:</p>
                <p><strong>{ExtrairToken(linkRedefinicao)}</strong></p>
                <p>O código expira em 30 minutos e só pode ser usado uma vez. Se você não fez esta solicitação, ignore este e-mail.</p>
                """,
        };
        using var client = new SmtpClient(host, port)
        {
            EnableSsl = bool.TryParse(_configuration["Smtp:UseSsl"], out var useSsl) && useSsl,
        };

        var user = _configuration["Smtp:Username"];
        if (!string.IsNullOrWhiteSpace(user))
            client.Credentials = new NetworkCredential(user, _configuration["Smtp:Password"]);

        await client.SendMailAsync(message);
    }

    private static string ExtrairToken(string linkRedefinicao)
    {
        const string marcador = "&token=";
        var indice = linkRedefinicao.IndexOf(marcador, StringComparison.Ordinal);
        return indice >= 0 ? linkRedefinicao[(indice + marcador.Length)..] : string.Empty;
    }
}
