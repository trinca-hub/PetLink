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
using PetLink_BackEnd.Security;
using PetLink_BackEnd.Data;

namespace PetLink_BackEnd.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class VeterinarioController : Controller
{
    private readonly IVeterinarioService _veterinarioService;
    private readonly IConfiguration _configuration;
    private readonly Response _response;
    private readonly AppDbContext _context;

    public VeterinarioController(IVeterinarioService veterinarioService, IConfiguration configuration, AppDbContext context)
    {
        _veterinarioService = veterinarioService;
        _response = new Response();
        _configuration = configuration;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var veterinariosDTO = await _veterinarioService.GetAll();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = veterinariosDTO;
        _response.Message = "Veterinarios(as) listados com sucesso";

        return Ok(_response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var veterinarioDTO = await _veterinarioService.GetById(id);

        if (veterinarioDTO is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "Veterinario(a) não encontrado";

            return NotFound(_response);
        }

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = veterinarioDTO;
        _response.Message = "Veterinario(a) listado com sucesso";

        return Ok(_response);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Post(VeterinarioDTO veterinarioDTO)
    {
        if (veterinarioDTO is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        if (!IsCrmvValido(veterinarioDTO.Crmv))
            return BadRequest(new { message = "O CRMV deve conter até 6 dígitos." });

        try
        {
            // Zeramos o id antes de cadastrar para que o banco gere automaticamente
            // e evite conflito com ids existentes
            veterinarioDTO.Id = 0;
            if (!PasswordSecurity.IsAcceptable(veterinarioDTO.Senha)) return BadRequest(new { message = "Senha fraca. Use 8 caracteres e 3 tipos: maiúscula, minúscula, número ou símbolo." });
            veterinarioDTO.Senha = PasswordSecurity.HashPassword(veterinarioDTO.Senha);
            await _veterinarioService.Create(veterinarioDTO);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = veterinarioDTO;
            _response.Message = " cadastrado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Não foi possível cadastrar o veterinario(a)";
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
            var email = login.Email.Trim().ToLowerInvariant(); var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "desconhecido";
            var bloqueio = await LoginAttemptSecurity.GetBlocked(_context, "vet", email, ip);
            if (bloqueio is not null) return StatusCode(429, new { message = "Muitas tentativas. Aguarde 1 minuto.", data = new { tentativasRestantes = 0, bloqueadoAte = bloqueio.BloqueadoAte } });
            login.Email = email;
            var veterinarioDTO = await _veterinarioService.Login(login);

            if (veterinarioDTO is null)
            {
                var restantes = await LoginAttemptSecurity.RegisterFailure(_context, "vet", email, ip);
                _response.Code = ResponseEnum.INVALID;
                _response.Data = new { tentativasRestantes = restantes };
                _response.Message = restantes == 0 ? "Limite de tentativas atingido. Aguarde 1 minuto." : $"Email ou senha incorretos. Tentativas restantes: {restantes}.";

                return BadRequest(_response);
            }
            await LoginAttemptSecurity.Clear(_context, "vet", email, ip);

            var token = GenerateJwtToken(veterinarioDTO);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = new
            {
                token = token,
                veterinario = veterinarioDTO
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

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        try
        {
            var email = User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email || c.Type == JwtRegisteredClaimNames.Email)
                ?.Value;

            if (string.IsNullOrEmpty(email))
            {
                _response.Code = ResponseEnum.INVALID;
                _response.Data = null;
                _response.Message = "Veterinário(a) não autenticado(a)";
                return Unauthorized(_response);
            }

            var veterinarioDTO = await _veterinarioService.GetByEmail(email);

            if (veterinarioDTO == null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "Veterinário(a) não encontrado(a)";
                return NotFound(_response);
            }

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = veterinarioDTO;
            _response.Message = "Veterinário(a) autenticado(a)";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Erro ao buscar veterinário(a) autenticado(a)";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };

            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, VeterinarioDTO veterinarioDTO)
    {
        if (veterinarioDTO is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        if (!IsCrmvValido(veterinarioDTO.Crmv))
            return BadRequest(new { message = "O CRMV deve conter até 6 dígitos." });

        try
        {
            var existingVeterinarioDTO = await _veterinarioService.GetById(id);
            if (existingVeterinarioDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O(a) veterinario(a) informado não existe";
                return NotFound(_response);
            }

            // A edição de cadastro não altera senha. Mantemos o hash atual e
            // evitamos persistir qualquer valor enviado pelo cliente.
            veterinarioDTO.Senha = existingVeterinarioDTO.Senha;
            await _veterinarioService.Update(veterinarioDTO, id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = veterinarioDTO;
            _response.Message = "Veterinario(a) atualizado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar atualizar os dados do(a) veterinario(a)";
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
            var existingVeterinarioDTO = await _veterinarioService.GetById(id);
            if (existingVeterinarioDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O(a) veterinario(a) informado não existe";
                return NotFound(_response);
            }

            await _veterinarioService.Remove(id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = null;
            _response.Message = "Veterinario(a) removido com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar remover o(a) veterinario(a)";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };
            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    private static bool IsCrmvValido(string? crmv)
    {
        return !string.IsNullOrWhiteSpace(crmv)
            && crmv.Length <= 6
            && crmv.All(char.IsDigit);
    }

    private static string GenerateSha256Hash(string input)
    {
        byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));

        StringBuilder builder = new();
        for (int i = 0; i < bytes.Length; i++)
        {
            builder.Append(bytes[i].ToString("x2"));
        }
        return builder.ToString();
    }

    private string GenerateJwtToken(VeterinarioDTO veterinarioDTO)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, veterinarioDTO.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, veterinarioDTO.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, veterinarioDTO.Email),
            new Claim(ClaimTypes.Role, "Veterinario"),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(2),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
