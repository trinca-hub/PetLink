using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities.AgendamentoConsulta;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    public class AgendamentoController : ControllerBase
    {
        private readonly IAgendamentoService _agendamentoService;
        private readonly IUsuarioService _usuarioService;
        private readonly IVeterinarioService _veterinarioService;

        public AgendamentoController(IAgendamentoService agendamentoService, IUsuarioService usuarioService, IVeterinarioService veterinarioService)
        {
            _agendamentoService = agendamentoService;
            _usuarioService = usuarioService;
            _veterinarioService = veterinarioService;
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] CriarSolicitacaoConsultaDTO dto)
        {
            try
            {
                var usuarioId = await GetUsuarioId();
                if (!usuarioId.HasValue)
                {
                    return Unauthorized(ApiResponseFactory.Failure<object>("Usuário não autenticado"));
                }

                if (dto.PetId <= 0 || dto.VeterinarioId <= 0)
                {
                    return BadRequest(ApiResponseFactory.Failure<object>("Dados inválidos"));
                }

                var agendamento = await _agendamentoService.CriarSolicitacao(dto, usuarioId.Value);
                return Ok(ApiResponseFactory.Success("Solicitação criada com sucesso", agendamento));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseFactory.Failure<object>("Erro ao criar solicitação", ex.Message));
            }
        }

        [HttpPost("veterinario")]
        public async Task<IActionResult> PostVeterinario([FromBody] CriarSolicitacaoVeterinarioDTO dto)
        {
            try
            {
                var veterinarioId = await GetVeterinarioId();
                if (!veterinarioId.HasValue)
                {
                    return Unauthorized(ApiResponseFactory.Failure<object>("Veterinário não autenticado"));
                }

                if (dto.UsuarioId <= 0 || dto.PetId <= 0)
                {
                    return BadRequest(ApiResponseFactory.Failure<object>("Dados inválidos"));
                }

                var agendamento = await _agendamentoService.CriarSolicitacaoVeterinario(dto, veterinarioId.Value);
                return Ok(ApiResponseFactory.Success("Solicitação criada com sucesso", agendamento));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseFactory.Failure<object>("Erro ao criar solicitação", ex.Message));
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var agendamento = await _agendamentoService.BuscarPorId(id);
            if (agendamento == null)
            {
                return NotFound(ApiResponseFactory.Failure<object>("Agendamento não encontrado"));
            }

            var usuarioId = await GetUsuarioId();
            var veterinarioId = await GetVeterinarioId();
            var permitidoTutor = usuarioId.HasValue && agendamento.UsuarioId == usuarioId.Value;
            var permitidoVet = veterinarioId.HasValue && agendamento.VeterinarioId == veterinarioId.Value;
            if (!permitidoTutor && !permitidoVet)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ApiResponseFactory.Failure<object>("Acesso negado"));
            }

            return Ok(ApiResponseFactory.Success("Agendamento listado com sucesso", agendamento));
        }

        [HttpGet("tutor")]
        public async Task<IActionResult> GetTutor()
        {
            var usuarioId = await GetUsuarioId();
            if (!usuarioId.HasValue)
            {
                return Unauthorized(ApiResponseFactory.Failure<object>("Usuário não autenticado"));
            }

            var agendamentos = await _agendamentoService.ListarSolicitacoesTutor(usuarioId.Value);
            return Ok(ApiResponseFactory.Success("Solicitações listadas com sucesso", agendamentos));
        }

        [HttpGet("veterinario")]
        public async Task<IActionResult> GetVeterinario()
        {
            var veterinarioId = await GetVeterinarioId();
            if (!veterinarioId.HasValue)
            {
                return Unauthorized(ApiResponseFactory.Failure<object>("Veterinário não autenticado"));
            }

            var agendamentos = await _agendamentoService.ListarSolicitacoesVeterinario(veterinarioId.Value);
            return Ok(ApiResponseFactory.Success("Solicitações listadas com sucesso", agendamentos));
        }

        [HttpPut("{id}/confirmar")]
        public async Task<IActionResult> Confirmar(int id, [FromBody] ConfirmarConsultaDTO dto)
        {
            try
            {
                var usuarioId = await GetUsuarioId();
                var veterinarioId = await GetVeterinarioId();
                if (!usuarioId.HasValue && !veterinarioId.HasValue)
                {
                    return Unauthorized(ApiResponseFactory.Failure<object>("Usuário ou veterinário não autenticado"));
                }

                var agendamento = await _agendamentoService.ConfirmarConsulta(id, dto, usuarioId ?? 0, veterinarioId);
                if (agendamento == null)
                {
                    return NotFound(ApiResponseFactory.Failure<object>("Agendamento não encontrado"));
                }

                return Ok(ApiResponseFactory.Success("Agendamento confirmado com sucesso", agendamento));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ApiResponseFactory.Failure<object>("Acesso negado", ex.Message));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseFactory.Failure<object>("Erro ao confirmar consulta", ex.Message));
            }
        }

        [HttpPut("{id}/recusar")]
        public async Task<IActionResult> Recusar(int id, [FromBody] RecusarConsultaDTO dto)
        {
            try
            {
                var usuarioId = await GetUsuarioId();
                var veterinarioId = await GetVeterinarioId();
                if (!usuarioId.HasValue && !veterinarioId.HasValue)
                {
                    return Unauthorized(ApiResponseFactory.Failure<object>("Usuário ou veterinário não autenticado"));
                }

                var agendamento = await _agendamentoService.RecusarConsulta(id, dto, usuarioId ?? 0, veterinarioId);
                if (agendamento == null)
                {
                    return NotFound(ApiResponseFactory.Failure<object>("Agendamento não encontrado"));
                }

                return Ok(ApiResponseFactory.Success("Agendamento recusado com sucesso", agendamento));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ApiResponseFactory.Failure<object>("Acesso negado", ex.Message));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseFactory.Failure<object>("Erro ao recusar consulta", ex.Message));
            }
        }

        [HttpPut("{id}/remarcar")]
        public async Task<IActionResult> Remarcar(int id, [FromBody] RemarcarConsultaDTO dto)
        {
            try
            {
                var usuarioId = await GetUsuarioId();
                var veterinarioId = await GetVeterinarioId();
                if (!usuarioId.HasValue && !veterinarioId.HasValue)
                {
                    return Unauthorized(ApiResponseFactory.Failure<object>("Usuário ou veterinário não autenticado"));
                }

                var agendamento = await _agendamentoService.RemarcarConsulta(id, dto, usuarioId ?? 0, veterinarioId);
                if (agendamento == null)
                {
                    return NotFound(ApiResponseFactory.Failure<object>("Agendamento não encontrado"));
                }

                return Ok(ApiResponseFactory.Success("Remarcação enviada com sucesso", agendamento));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ApiResponseFactory.Failure<object>("Acesso negado", ex.Message));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseFactory.Failure<object>("Erro ao remarcar consulta", ex.Message));
            }
        }

        [HttpPut("{id}/cancelar")]
        public async Task<IActionResult> Cancelar(int id, [FromBody] CancelarConsultaDTO dto)
        {
            try
            {
                var usuarioId = await GetUsuarioId();
                var veterinarioId = await GetVeterinarioId();
                if (!usuarioId.HasValue && !veterinarioId.HasValue)
                {
                    return Unauthorized(ApiResponseFactory.Failure<object>("Usuário ou veterinário não autenticado"));
                }

                var agendamento = await _agendamentoService.CancelarConsulta(id, dto, usuarioId ?? 0, veterinarioId);
                if (agendamento == null)
                {
                    return NotFound(ApiResponseFactory.Failure<object>("Agendamento não encontrado"));
                }

                return Ok(ApiResponseFactory.Success("Agendamento cancelado com sucesso", agendamento));
            }
            catch (UnauthorizedAccessException ex)
            {
                return StatusCode(StatusCodes.Status403Forbidden, ApiResponseFactory.Failure<object>("Acesso negado", ex.Message));
            }
            catch (Exception ex)
            {
                return BadRequest(ApiResponseFactory.Failure<object>("Erro ao cancelar consulta", ex.Message));
            }
        }

        private async Task<int?> GetUsuarioId()
        {
            var perfil = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
            if (string.Equals(perfil, "Veterinario", StringComparison.OrdinalIgnoreCase))
                return null;

            var email = User.Claims
                .FirstOrDefault(c => c.Type == ClaimTypes.Email || c.Type == JwtRegisteredClaimNames.Email)
                ?.Value;

            if (string.IsNullOrEmpty(email))
                return null;

            var usuario = await _usuarioService.GetByEmail(email);
            return usuario?.Id;
        }

        private async Task<int?> GetVeterinarioId()
        {
            var perfil = User.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role)?.Value;
            if (string.Equals(perfil, "Tutor", StringComparison.OrdinalIgnoreCase))
                return null;

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
