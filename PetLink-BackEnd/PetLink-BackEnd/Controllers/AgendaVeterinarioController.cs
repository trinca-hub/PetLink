using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities.AgendaVeterinario;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class AgendaVeterinarioController : ControllerBase
    {
        private readonly IAgendaVeterinarioService _agendaService;
        private readonly IVeterinarioService _veterinarioService;

        public AgendaVeterinarioController(IAgendaVeterinarioService agendaService, IVeterinarioService veterinarioService)
        {
            _agendaService = agendaService;
            _veterinarioService = veterinarioService;
        }

        [HttpGet("{veterinarioId}")]
        public async Task<IActionResult> GetByVeterinarioId(int veterinarioId)
        {
            var agenda = await _agendaService.BuscarAgendaVeterinario(veterinarioId);
            if (agenda == null)
            {
                return NotFound(ApiResponseFactory.Failure<object>("Agenda não encontrada"));
            }

            return Ok(ApiResponseFactory.Success("Agenda listada com sucesso", agenda));
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CriarAgendaDTO dto)
        {
            try
            {
                var vetId = await GetVeterinarioId();
                if (dto.VeterinarioId <= 0 && !vetId.HasValue)
                {
                    return BadRequest(ApiResponseFactory.Failure<object>("Veterinário inválido"));
                }

                var agenda = await _agendaService.CriarAgenda(dto, vetId);
                return Ok(ApiResponseFactory.Success("Agenda criada com sucesso", agenda));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseFactory.Failure<object>("Erro ao criar agenda", ex.Message));
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Put(int id, [FromBody] AtualizarAgendaDTO dto)
        {
            try
            {
                var vetId = await GetVeterinarioId();
                var agenda = await _agendaService.AtualizarAgenda(id, dto, vetId);
                if (agenda == null)
                {
                    return NotFound(ApiResponseFactory.Failure<object>("Agenda não encontrada"));
                }

                return Ok(ApiResponseFactory.Success("Agenda atualizada com sucesso", agenda));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ApiResponseFactory.Failure<object>("Acesso negado", ex.Message));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseFactory.Failure<object>("Erro ao atualizar agenda", ex.Message));
            }
        }

        [HttpGet("{veterinarioId}/slots")]
        public async Task<IActionResult> GetSlots(int veterinarioId, [FromQuery] DateTime? dataInicio)
        {
            var slots = await _agendaService.GerarSlotsDisponiveisTutor(veterinarioId, dataInicio);
            return Ok(ApiResponseFactory.Success("Slots disponíveis listados com sucesso", slots));
        }

        private async Task<int?> GetVeterinarioId()
        {
            var email = User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email || c.Type == JwtRegisteredClaimNames.Email)
                ?.Value;

            if (string.IsNullOrEmpty(email))
                return null;

            var veterinario = await _veterinarioService.GetByEmail(email);
            return veterinario?.Id;
        }
    }
}
