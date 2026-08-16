using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    [Authorize]
    public class ServicoController : ControllerBase
    {

        private readonly IServicoService _servicoService;
        private readonly IAdministradorService _administradorService;
        private readonly Response _response;

        public ServicoController(IServicoService servicoService, IAdministradorService administradorService)
        {
            _servicoService = servicoService;
            _administradorService = administradorService;
            _response = new Response();
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var servicosDTO = await _servicoService.GetAll();

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = servicosDTO;
            _response.Message = "Serviços listados com sucesso";

            return Ok(_response);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var servicoDTO = await _servicoService.GetById(id);

            if (servicoDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "Serviço não encontrado";

                return NotFound(_response);
            }

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = servicoDTO;
            _response.Message = "Serviço listado com sucesso";

            return Ok(_response);
        }

        [HttpPost]
        public async Task<IActionResult> Post(ServicoDTO servicoDTO)
        {
            if (servicoDTO is null)
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
                servicoDTO.Id = 0;
                await _servicoService.Create(servicoDTO);

                _response.Code = ResponseEnum.SUCCESS;
                _response.Data = servicoDTO;
                _response.Message = " cadastrado com sucesso";

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.Code = ResponseEnum.ERROR;
                _response.Message = "Não foi possível cadastrar o serviço";
                _response.Data = new
                {
                    ErrorMessage = ex.Message,
                    StackTrace = ex.StackTrace ?? "No stack trace available"
                };
                return StatusCode(StatusCodes.Status500InternalServerError, _response);
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, ServicoDTO servicoDTO)
        {
            if (servicoDTO is null)
            {
                _response.Code = ResponseEnum.INVALID;
                _response.Data = null;
                _response.Message = "Dados inválidos";

                return BadRequest(_response);
            }

            try
            {
                var existingServicoDTO = await _servicoService.GetById(id);
                if (existingServicoDTO is null)
                {
                    _response.Code = ResponseEnum.NOT_FOUND;
                    _response.Data = null;
                    _response.Message = "O serviço informado não existe";
                    return NotFound(_response);
                }

                await _servicoService.Update(servicoDTO, id);

                _response.Code = ResponseEnum.SUCCESS;
                _response.Data = servicoDTO;
                _response.Message = "Serviço atualizado com sucesso";

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.Code = ResponseEnum.ERROR;
                _response.Message = "Ocorreu um erro ao tentar atualizar os dados do serviço";
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
                var existingServicoDTO = await _servicoService.GetById(id);
                if (existingServicoDTO is null)
                {
                    _response.Code = ResponseEnum.NOT_FOUND;
                    _response.Data = null;
                    _response.Message = "O serviço informado não existe";
                    return NotFound(_response);
                }

                await _servicoService.Remove(id);

                _response.Code = ResponseEnum.SUCCESS;
                _response.Data = null;
                _response.Message = "Serviço removido com sucesso";

                return Ok(_response);
            }
            catch (Exception ex)
            {
                _response.Code = ResponseEnum.ERROR;
                _response.Message = "Ocorreu um erro ao tentar remover o serviço";
                _response.Data = new
                {
                    ErrorMessage = ex.Message,
                    StackTrace = ex.StackTrace ?? "No stack trace available"
                };
                return StatusCode(StatusCodes.Status500InternalServerError, _response);
            }
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAllAdmin()
        {
            if (!await IsAdminAuthenticated())
                return Forbid();

            return await GetAll();
        }

        [HttpPost("admin")]
        public async Task<IActionResult> PostAdmin(ServicoDTO servicoDTO)
        {
            if (!await IsAdminAuthenticated())
                return Forbid();

            return await Post(servicoDTO);
        }

        [HttpPut("admin/{id}")]
        public async Task<IActionResult> PutAdmin(int id, ServicoDTO servicoDTO)
        {
            if (!await IsAdminAuthenticated())
                return Forbid();

            return await Put(id, servicoDTO);
        }

        [HttpDelete("admin/{id}")]
        public async Task<IActionResult> DeleteAdmin(int id)
        {
            if (!await IsAdminAuthenticated())
                return Forbid();

            return await Delete(id);
        }

        private async Task<bool> IsAdminAuthenticated()
        {
            var email = User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email || c.Type == JwtRegisteredClaimNames.Email)
                ?.Value;

            if (string.IsNullOrEmpty(email))
                return false;

            var admin = await _administradorService.GetByEmail(email);
            return admin is not null;
        }
    }
}
