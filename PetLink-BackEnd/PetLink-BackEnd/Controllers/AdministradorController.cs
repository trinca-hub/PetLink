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

namespace PetLink_BackEnd.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class AdministradorController : Controller
    {
        private readonly IAdministradorService _administradorService;
        private readonly IConfiguration _configuration;
        private readonly Response _response;

        public AdministradorController(IAdministradorService administradorService, IConfiguration configuration)
        {
            _administradorService = administradorService;
            _response = new Response();
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var administradoresDTO = await _administradorService.GetAll();

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = administradoresDTO;
            _response.Message = "Administradores listados com sucesso";

            return Ok(_response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var administradorDTO = await _administradorService.GetById(id);

            if (administradorDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "Administrador não encontrado";

                return NotFound(_response);
            }

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = administradorDTO;
            _response.Message = "Administrador listado com sucesso";

            return Ok(_response);
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> Post(AdministradorDTO administradorDTO)
        {
            if (administradorDTO is null)
            {
                _response.Code = ResponseEnum.INVALID;
                _response.Data = null;
                _response.Message = "Dados inválidos";

                return BadRequest(_response);
            }

            try
            {
                administradorDTO.Id = 0;
                administradorDTO.Senha = GenerateSha256Hash(administradorDTO.Senha);
                await _administradorService.Create(administradorDTO);

                _response.Code = ResponseEnum.SUCCESS;
                _response.Data = administradorDTO;
                _response.Message = "Administrador cadastrado com sucesso";

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.Code = ResponseEnum.ERROR;
                _response.Message = "Não foi possível cadastrar o administrador";
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
                var administradorDTO = await _administradorService.Login(login);

                if (administradorDTO is null)
                {
                    _response.Code = ResponseEnum.INVALID;
                    _response.Data = null;
                    _response.Message = "Email ou senha incorretos";

                    return BadRequest(_response);
                }

                var token = GenerateJwtToken(administradorDTO);

                _response.Code = ResponseEnum.SUCCESS;
                _response.Data = new
                {
                    token = token,
                    administrador = administradorDTO
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
                    _response.Message = "Administrador não autenticado";
                    return Unauthorized(_response);
                }

                var administradorDTO = await _administradorService.GetByEmail(email);

                if (administradorDTO == null)
                {
                    _response.Code = ResponseEnum.NOT_FOUND;
                    _response.Data = null;
                    _response.Message = "Administrador não encontrado";
                    return NotFound(_response);
                }

                _response.Code = ResponseEnum.SUCCESS;
                _response.Data = administradorDTO;
                _response.Message = "Administrador autenticado";

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.Code = ResponseEnum.ERROR;
                _response.Message = "Erro ao buscar administrador autenticado";
                _response.Data = new
                {
                    ErrorMessage = ex.Message,
                    StackTrace = ex.StackTrace ?? "No stack trace available"
                };

                return StatusCode(StatusCodes.Status500InternalServerError, _response);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, AdministradorDTO administradorDTO)
        {
            if (administradorDTO is null)
            {
                _response.Code = ResponseEnum.INVALID;
                _response.Data = null;
                _response.Message = "Dados inválidos";

                return BadRequest(_response);
            }

            try
            {
                var existingAdministradorDTO = await _administradorService.GetById(id);
                if (existingAdministradorDTO is null)
                {
                    _response.Code = ResponseEnum.NOT_FOUND;
                    _response.Data = null;
                    _response.Message = "O administrador informado não existe";
                    return NotFound(_response);
                }

                await _administradorService.Update(administradorDTO, id);

                _response.Code = ResponseEnum.SUCCESS;
                _response.Data = administradorDTO;
                _response.Message = "Administrador atualizado com sucesso";

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.Code = ResponseEnum.ERROR;
                _response.Message = "Ocorreu um erro ao tentar atualizar os dados do administrador";
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
                var existingAdministradorDTO = await _administradorService.GetById(id);
                if (existingAdministradorDTO is null)
                {
                    _response.Code = ResponseEnum.NOT_FOUND;
                    _response.Data = null;
                    _response.Message = "O administrador informado não existe";
                    return NotFound(_response);
                }

                await _administradorService.Remove(id);

                _response.Code = ResponseEnum.SUCCESS;
                _response.Data = null;
                _response.Message = "Administrador removido com sucesso";

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.Code = ResponseEnum.ERROR;
                _response.Message = "Ocorreu um erro ao tentar remover o administrador";
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

        private string GenerateJwtToken(AdministradorDTO administradorDTO)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, administradorDTO.Id.ToString()),
                new Claim(ClaimTypes.NameIdentifier, administradorDTO.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, administradorDTO.Email),
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
}
