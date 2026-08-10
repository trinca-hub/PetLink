using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Services.Interfaces;
using PetLink_BackEnd.Data;
using PetLink_BackEnd.Objects.Models;
using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Security;
using System.Security.Claims;


namespace PetLink_BackEnd.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class UsuarioController : Controller
{
    private readonly IUsuarioService _usuarioService;
    private readonly IConfiguration _configuration;
    private readonly Response _response;
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public UsuarioController(
        IUsuarioService usuarioService,
        IConfiguration configuration,
        AppDbContext context,
        IEmailService emailService)
    {
        _usuarioService = usuarioService;
        _response = new Response();
        _configuration = configuration;
        _context = context;
        _emailService = emailService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var usuariosDTO = await _usuarioService.GetAll();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = usuariosDTO;
        _response.Message = "Usuários listados com sucesso";

        return Ok(_response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var usuarioDTO = await _usuarioService.GetById(id);

        if (usuarioDTO is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "Usuário não encontrado";

            return NotFound(_response);
        }

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = usuarioDTO;
        _response.Message = "Usuário listado com sucesso";

        return Ok(_response);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Post(UsuarioDTO usuarioDTO)
    {
        if (usuarioDTO is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        try
        {
            // Zeramos o id antes de cadastrar para que o banco gere automaticamente
            // e evite conflito com ids existentes
            usuarioDTO.Id = 0;
            usuarioDTO.Telefone ??= string.Empty;
            usuarioDTO.Cep ??= string.Empty;
            usuarioDTO.Uf ??= string.Empty;
            usuarioDTO.Cidade ??= string.Empty;
            usuarioDTO.Bairro ??= string.Empty;
            usuarioDTO.Rua ??= string.Empty;

            if (!PasswordSecurity.IsAcceptable(usuarioDTO.Senha))
            {
                _response.Code = ResponseEnum.INVALID;
                _response.Data = null;
                _response.Message = "A senha deve ter ao menos 8 caracteres e combinar 3 tipos: letra maiúscula, minúscula, número ou símbolo.";
                return BadRequest(_response);
            }

            usuarioDTO.Senha = PasswordSecurity.HashPassword(usuarioDTO.Senha);
            await _usuarioService.Create(usuarioDTO);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = usuarioDTO;
            _response.Message = " cadastrado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Não foi possível cadastrar o usuário";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };
            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    [HttpPost("Login")]
    [AllowAnonymous]
    public async Task<ActionResult> Login([FromBody] Login login)
    {
        if (login is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        try
        {
            var email = login.Email.Trim().ToLowerInvariant();
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "desconhecido";
            var agora = DateTime.UtcNow;
            var tentativa = await _context.TentativasLogin
                .FirstOrDefaultAsync(item => item.Email == email && item.Ip == ip);

            if (tentativa?.BloqueadoAte > agora)
            {
                _response.Code = ResponseEnum.INVALID;
                _response.Data = new { tentativasRestantes = 0, bloqueadoAte = tentativa.BloqueadoAte };
                _response.Message = "Muitas tentativas. Tente novamente em 1 minuto.";
                return StatusCode(StatusCodes.Status429TooManyRequests, _response);
            }

            if (tentativa?.BloqueadoAte is not null)
            {
                tentativa.Falhas = 0;
                tentativa.BloqueadoAte = null;
            }

            login.Email = email;
            var usuarioDTO = await _usuarioService.Login(login);

            if (usuarioDTO is null)
            {
                tentativa ??= new TentativaLogin { Email = email, Ip = ip };
                tentativa.Falhas++;
                tentativa.AtualizadoEm = agora;
                var bloqueado = tentativa.Falhas >= 5;
                if (bloqueado)
                    tentativa.BloqueadoAte = agora.AddMinutes(1);

                if (tentativa.Id == 0)
                    _context.TentativasLogin.Add(tentativa);
                await _context.SaveChangesAsync();

                _response.Code = ResponseEnum.INVALID;
                _response.Data = new
                {
                    tentativasRestantes = bloqueado ? 0 : 5 - tentativa.Falhas,
                    bloqueadoAte = tentativa.BloqueadoAte,
                };
                _response.Message = bloqueado
                    ? "Limite de tentativas atingido. Aguarde 1 minuto para tentar novamente."
                    : $"E-mail ou senha incorretos. Tentativas restantes: {5 - tentativa.Falhas}.";

                return BadRequest(_response);
            }

            if (tentativa is not null)
            {
                _context.TentativasLogin.Remove(tentativa);
                await _context.SaveChangesAsync();
            }

            var token = GenerateJwtToken(usuarioDTO);

            _response.Code = ResponseEnum.SUCCESS;

            // 🔥 AGORA RETORNA TOKEN + USUÁRIO
            _response.Data = new
            {
                token = token,
                usuario = usuarioDTO
            };

            _response.Message = "Login realizado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Não foi possível realizar o login";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };

            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    [HttpPost("recuperar-senha")]
    [AllowAnonymous]
    public async Task<IActionResult> SolicitarRedefinicaoSenha([FromBody] SolicitacaoRedefinicaoSenha solicitacao)
    {
        const string mensagem = "Se o e-mail estiver cadastrado, enviaremos um link para redefinir sua senha.";
        var email = solicitacao.Email.Trim().ToLowerInvariant();

        try
        {
            var usuario = await _context.Usuarios.FirstOrDefaultAsync(item => item.Email.ToLower() == email);
            if (usuario is not null)
            {
                var agora = DateTime.UtcNow;
                var tokensAnteriores = await _context.TokensRedefinicaoSenha
                    .Where(token => token.UsuarioId == usuario.Id && token.UsadoEm == null)
                    .ToListAsync();
                foreach (var tokenAnterior in tokensAnteriores)
                    tokenAnterior.UsadoEm = agora;

                var token = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
                _context.TokensRedefinicaoSenha.Add(new TokenRedefinicaoSenha
                {
                    UsuarioId = usuario.Id,
                    TokenHash = GenerateSha256Hash(token),
                    ExpiraEm = agora.AddMinutes(30),
                });
                await _context.SaveChangesAsync();

                var link = $"petlinkfrontend://redefinir-senha?email={Uri.EscapeDataString(usuario.Email)}&token={token}";
                await _emailService.EnviarRedefinicaoSenha(usuario.Email, link);
            }

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = null;
            _response.Message = mensagem;
            return Ok(_response);
        }
        catch (Exception)
        {
            // A resposta não deve revelar se uma conta existe nem detalhes do provedor de e-mail.
            _response.Code = ResponseEnum.ERROR;
            _response.Data = null;
            _response.Message = "Não foi possível processar a solicitação agora. Tente novamente mais tarde.";
            return StatusCode(StatusCodes.Status503ServiceUnavailable, _response);
        }
    }

    [HttpPost("redefinir-senha")]
    [AllowAnonymous]
    public async Task<IActionResult> RedefinirSenha([FromBody] RedefinicaoSenha redefinicao)
    {
        if (!PasswordSecurity.IsAcceptable(redefinicao.NovaSenha))
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "A senha deve ter ao menos 8 caracteres e combinar 3 tipos: letra maiúscula, minúscula, número ou símbolo.";
            return BadRequest(_response);
        }

        var email = redefinicao.Email.Trim().ToLowerInvariant();
        var tokenHash = GenerateSha256Hash(redefinicao.Token.Trim());
        var agora = DateTime.UtcNow;

        var token = await _context.TokensRedefinicaoSenha
            .Include(item => item.Usuario)
            .FirstOrDefaultAsync(item =>
                item.TokenHash == tokenHash &&
                item.UsadoEm == null &&
                item.ExpiraEm > agora &&
                item.Usuario.Email.ToLower() == email);

        if (token is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "O link de redefinição é inválido ou expirou.";
            return BadRequest(_response);
        }

        token.Usuario.Senha = PasswordSecurity.HashPassword(redefinicao.NovaSenha);
        token.UsadoEm = agora;
        await _context.SaveChangesAsync();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = null;
        _response.Message = "Senha redefinida com sucesso. Faça login com a nova senha.";
        return Ok(_response);
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        try
        {
            // Pega o email salvo no token (claim)
            var email = User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email || c.Type == JwtRegisteredClaimNames.Email)
                ?.Value;

            if (string.IsNullOrEmpty(email))
            {
                _response.Code = ResponseEnum.INVALID;
                _response.Data = null;
                _response.Message = "Usuário não autenticado";
                return Unauthorized(_response);
            }

            // Busca o usuário pelo email
            var usuarioDTO = await _usuarioService.GetByEmail(email);

            if (usuarioDTO == null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "Usuário não encontrado";
                return NotFound(_response);
            }

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = usuarioDTO;
            _response.Message = "Usuário autenticado";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Erro ao buscar usuário autenticado";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };

            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }


    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, UsuarioDTO usuarioDTO)
    {
        if (usuarioDTO is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        try
        {
            var existingUsuarioDTO = await _usuarioService.GetById(id);
            if (existingUsuarioDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O usuário informado não existe";
                return NotFound(_response);
            }

            await _usuarioService.Update(usuarioDTO, id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = usuarioDTO;
            _response.Message = "Usuário atualizado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar atualizar os dados do usuário";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };
            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var existingUsuarioDTO = await _usuarioService.GetById(id);
            if (existingUsuarioDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O usuario informado não existe";
                return NotFound(_response);
            }

            await _usuarioService.Remove(id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = null;
            _response.Message = "Usuário removido com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar remover o usuario";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };
            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    private static string GenerateSha256Hash(string input)
    {
        // Converte a string de entrada para um array de bytes e computa o hash
        byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));

        // Converte o array de bytes para uma string hexadecimal
        StringBuilder builder = new();
        for (int i = 0; i < bytes.Length; i++)
        {
            // Formata cada byte como dois dígitos hexadecimais
            builder.Append(bytes[i].ToString("x2"));
        }
        return builder.ToString();
    }

    private string GenerateJwtToken(UsuarioDTO usuarioDTO)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
        // Claims são informações sobre o usuário que você quer armazenar no token
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuarioDTO.Id.ToString()), // ✅ agora é o ID
            new Claim(ClaimTypes.NameIdentifier, usuarioDTO.Id.ToString()),   // ✅ padrão
            new Claim(JwtRegisteredClaimNames.Email, usuarioDTO.Email),
            new Claim(ClaimTypes.Role, "Tutor"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };


        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(2), // Define que o token expira em 2 horas
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
