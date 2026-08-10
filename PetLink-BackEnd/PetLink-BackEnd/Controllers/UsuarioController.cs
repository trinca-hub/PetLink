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

    public UsuarioController(IUsuarioService usuarioService, IConfiguration configuration)
    {
        _usuarioService = usuarioService;
        _response = new Response();
        _configuration = configuration;
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

            // Cria o hash da senha para maior segurança
            usuarioDTO.Senha = GenerateSha256Hash(usuarioDTO.Senha);
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
            login.Password = GenerateSha256Hash(login.Password);
            var usuarioDTO = await _usuarioService.Login(login);

            if (usuarioDTO is null)
            {
                _response.Code = ResponseEnum.INVALID;
                _response.Data = null;
                _response.Message = "Email ou senha incorretos";

                return BadRequest(_response);
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
