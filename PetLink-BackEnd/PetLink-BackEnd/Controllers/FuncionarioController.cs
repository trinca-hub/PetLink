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
public class FuncionarioController : Controller
{
    private readonly IFuncionarioService _funcionarioService;
    private readonly IConfiguration _configuration;
    private readonly Response _response;
    private readonly AppDbContext _context;

    public FuncionarioController(IFuncionarioService funcionarioService, IConfiguration configuration, AppDbContext context)
    {
        _funcionarioService = funcionarioService;
        _response = new Response();
        _configuration = configuration;
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var funcionariosDTO = await _funcionarioService.GetAll();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = funcionariosDTO;
        _response.Message = "Funcionários listados com sucesso";

        return Ok(_response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var funcionarioDTO = await _funcionarioService.GetById(id);

        if (funcionarioDTO is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "Funcionário não encontrado";

            return NotFound(_response);
        }

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = funcionarioDTO;
        _response.Message = "Funcionário listado com sucesso";

        return Ok(_response);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<IActionResult> Post(FuncionarioDTO funcionarioDTO)
    {
        if (funcionarioDTO is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        try
        {
            funcionarioDTO.Id = 0;
            if (!PasswordSecurity.IsAcceptable(funcionarioDTO.Senha)) return BadRequest(new { message = "Senha fraca. Use 8 caracteres e 3 tipos: maiúscula, minúscula, número ou símbolo." });
            funcionarioDTO.Senha = PasswordSecurity.HashPassword(funcionarioDTO.Senha);
            await _funcionarioService.Create(funcionarioDTO);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = funcionarioDTO;
            _response.Message = "Funcionário cadastrado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Não foi possível cadastrar o funcionário";
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
            var bloqueio = await LoginAttemptSecurity.GetBlocked(_context, "func", email, ip);
            if (bloqueio is not null) return StatusCode(429, new { message = "Muitas tentativas. Aguarde 1 minuto.", data = new { tentativasRestantes = 0, bloqueadoAte = bloqueio.BloqueadoAte } });
            login.Email = email;
            var funcionarioDTO = await _funcionarioService.Login(login);

            if (funcionarioDTO is null)
            {
                var restantes = await LoginAttemptSecurity.RegisterFailure(_context, "func", email, ip);
                _response.Code = ResponseEnum.INVALID;
                _response.Data = new { tentativasRestantes = restantes };
                _response.Message = restantes == 0 ? "Limite de tentativas atingido. Aguarde 1 minuto." : $"Email ou senha incorretos. Tentativas restantes: {restantes}.";

                return BadRequest(_response);
            }
            await LoginAttemptSecurity.Clear(_context, "func", email, ip);

            var token = GenerateJwtToken(funcionarioDTO);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = new
            {
                token = token,
                funcionario = funcionarioDTO
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
                _response.Message = "Funcionário não autenticado";
                return Unauthorized(_response);
            }

            var funcionarioDTO = await _funcionarioService.GetByEmail(email);

            if (funcionarioDTO == null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "Funcionário não encontrado";
                return NotFound(_response);
            }

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = funcionarioDTO;
            _response.Message = "Funcionário autenticado";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Erro ao buscar funcionário autenticado";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };

            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, FuncionarioDTO funcionarioDTO)
    {
        if (funcionarioDTO is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        try
        {
            var existingFuncionarioDTO = await _funcionarioService.GetById(id);
            if (existingFuncionarioDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O funcionário informado não existe";
                return NotFound(_response);
            }

            await _funcionarioService.Update(funcionarioDTO, id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = funcionarioDTO;
            _response.Message = "Funcionário atualizado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar atualizar os dados do funcionário";
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
            var existingFuncionarioDTO = await _funcionarioService.GetById(id);
            if (existingFuncionarioDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O funcionário informado não existe";
                return NotFound(_response);
            }

            await _funcionarioService.Remove(id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = null;
            _response.Message = "Funcionário removido com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar remover o funcionário";
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
        byte[] bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));

        StringBuilder builder = new();
        for (int i = 0; i < bytes.Length; i++)
        {
            builder.Append(bytes[i].ToString("x2"));
        }
        return builder.ToString();
    }

    private string GenerateJwtToken(FuncionarioDTO funcionarioDTO)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, funcionarioDTO.Id.ToString()),
            new Claim(ClaimTypes.NameIdentifier, funcionarioDTO.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, funcionarioDTO.Email),
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
