using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Security;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Controllers;

[ApiController]
[Route("api/v1/GestaoSeguranca")]
public class GestaoSegurancaController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;
    public GestaoSegurancaController(AppDbContext context, IEmailService emailService) => (_context, _emailService) = (context, emailService);

    [HttpPost("recuperar-senha"), AllowAnonymous]
    public async Task<IActionResult> Solicitar([FromBody] SolicitacaoRedefinicaoSenhaGestao request)
    {
        var perfil = NormalizarPerfil(request.Perfil);
        var email = request.Email.Trim().ToLowerInvariant();
        if (perfil is null) return BadRequest(new { message = "Perfil inválido." });

        if (await ContaExiste(perfil, email))
        {
            var agora = DateTime.UtcNow;
            var anteriores = await _context.Set<TokenRedefinicaoSenhaGestao>().Where(x => x.Perfil == perfil && x.Email == email && x.UsadoEm == null).ToListAsync();
            anteriores.ForEach(x => x.UsadoEm = agora);
            var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            _context.Set<TokenRedefinicaoSenhaGestao>().Add(new TokenRedefinicaoSenhaGestao { Perfil = perfil, Email = email, TokenHash = Hash(token), ExpiraEm = agora.AddMinutes(30) });
            await _context.SaveChangesAsync();
            await _emailService.EnviarRedefinicaoSenha(email, $"petlinkgestao://redefinir-senha?perfil={perfil}&email={Uri.EscapeDataString(email)}&token={token}");
        }
        return Ok(new { message = "Se o e-mail estiver cadastrado, enviaremos as instruções de recuperação." });
    }

    [HttpPost("redefinir-senha"), AllowAnonymous]
    public async Task<IActionResult> Redefinir([FromBody] RedefinicaoSenhaGestao request)
    {
        var perfil = NormalizarPerfil(request.Perfil);
        var email = request.Email.Trim().ToLowerInvariant();
        if (perfil is null || !PasswordSecurity.IsAcceptable(request.NovaSenha)) return BadRequest(new { message = "Dados inválidos ou senha fraca." });
        var agora = DateTime.UtcNow;
        var token = await _context.Set<TokenRedefinicaoSenhaGestao>().FirstOrDefaultAsync(x => x.Perfil == perfil && x.Email == email && x.TokenHash == Hash(NormalizarToken(request.Token)) && x.UsadoEm == null && x.ExpiraEm > agora);
        if (token is null) return BadRequest(new { message = "Código inválido ou expirado." });
        var senhaAtual = await ObterSenhaAtual(perfil, email);
        if (senhaAtual is null) return BadRequest(new { message = "Conta não encontrada." });
        if (PasswordSecurity.Verify(request.NovaSenha, senhaAtual)) return BadRequest(new { message = "A nova senha não pode ser igual à senha atual." });
        var senha = PasswordSecurity.HashPassword(request.NovaSenha);
        var atualizado = perfil switch
        {
            "adm" => await AtualizarAdministrador(email, senha),
            "func" => await AtualizarFuncionario(email, senha),
            "vet" => await AtualizarVeterinario(email, senha),
            _ => false,
        };
        if (!atualizado) return BadRequest(new { message = "Conta não encontrada." });
        token.UsadoEm = agora;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Senha redefinida com sucesso." });
    }

    private Task<bool> ContaExiste(string perfil, string email) => perfil switch { "adm" => _context.Administradores.AnyAsync(x => x.Email == email), "func" => _context.Funcionarios.AnyAsync(x => x.Email == email), "vet" => _context.Veterinarios.AnyAsync(x => x.Email == email), _ => Task.FromResult(false) };
    private Task<string?> ObterSenhaAtual(string perfil, string email) => perfil switch
    {
        "adm" => _context.Administradores.Where(x => x.Email == email).Select(x => x.Senha).FirstOrDefaultAsync(),
        "func" => _context.Funcionarios.Where(x => x.Email == email).Select(x => x.Senha).FirstOrDefaultAsync(),
        "vet" => _context.Veterinarios.Where(x => x.Email == email).Select(x => x.Senha).FirstOrDefaultAsync(),
        _ => Task.FromResult<string?>(null),
    };
    private async Task<bool> AtualizarAdministrador(string email, string senha) { var x = await _context.Administradores.FirstOrDefaultAsync(x => x.Email == email); if (x is null) return false; x.Senha = senha; return true; }
    private async Task<bool> AtualizarFuncionario(string email, string senha) { var x = await _context.Funcionarios.FirstOrDefaultAsync(x => x.Email == email); if (x is null) return false; x.Senha = senha; return true; }
    private async Task<bool> AtualizarVeterinario(string email, string senha) { var x = await _context.Veterinarios.FirstOrDefaultAsync(x => x.Email == email); if (x is null) return false; x.Senha = senha; return true; }
    private static string? NormalizarPerfil(string perfil) => perfil.Trim().ToLowerInvariant() is "adm" or "func" or "vet" ? perfil.Trim().ToLowerInvariant() : null;
    private static string NormalizarToken(string token) => string.Concat(token.Where(character => !char.IsWhiteSpace(character)));
    private static string Hash(string input) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(input)));
}
