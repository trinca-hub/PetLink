using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;
using PetLink_BackEnd.Data;

namespace PetLink_BackEnd.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class PedidoController : Controller
{
    private readonly IPedidoService _pedidoService;
    private readonly IAdministradorService _administradorService;
    private readonly AppDbContext _context;
    private readonly Response _response;

    public PedidoController(
        IPedidoService pedidoService,
        IAdministradorService administradorService,
        AppDbContext context)
    {
        _pedidoService = pedidoService;
        _administradorService = administradorService;
        _context = context;
        _response = new Response();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var pedidosDTO = await _pedidoService.GetAll();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = pedidosDTO;
        _response.Message = "Pedidos listados com sucesso";

        return Ok(_response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var pedidoDTO = await _pedidoService.GetById(id);

        if (pedidoDTO is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "Pedido não encontrado";

            return NotFound(_response);
        }

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = pedidoDTO;
        _response.Message = "Pedido listado com sucesso";

        return Ok(_response);
    }

    [HttpGet("usuario/{usuarioId}")]
    public async Task<IActionResult> GetByUsuarioId(int usuarioId)
    {
        var pedidosDTO = await _pedidoService.GetByUsuarioId(usuarioId);

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = pedidosDTO;
        _response.Message = "Pedidos do usuário listados com sucesso";

        return Ok(_response);
    }

    [HttpPost]
    public async Task<IActionResult> Post(PedidoDTO pedidoDTO)
    {
        if (pedidoDTO is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        try
        {
            // ✅ agora retorna o ID real
            var id = await _pedidoService.CreateAndReturnId(pedidoDTO);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = new { id };
            _response.Message = "Pedido cadastrado com sucesso";

            return Ok(_response);
        }
        catch (ArgumentException ex)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = ex.Message;

            return BadRequest(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar cadastrar o pedido";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };

            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, PedidoDTO pedidoDTO)
    {
        if (pedidoDTO is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        try
        {
            var existingPedidoDTO = await _pedidoService.GetById(id);
            if (existingPedidoDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O pedido informado não existe";
                return NotFound(_response);
            }

            await _pedidoService.Update(pedidoDTO, id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = pedidoDTO;
            _response.Message = "Pedido atualizado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar atualizar os dados do pedido";
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
            var existingPedidoDTO = await _pedidoService.GetById(id);
            if (existingPedidoDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O pedido informado não existe";
                return NotFound(_response);
            }

            await _pedidoService.CancelAndRestock(id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = null;
            _response.Message = "Pedido removido com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar remover o pedido";
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
    public async Task<IActionResult> PostAdmin(AdminCreatePedidoDTO dto)
    {
        if (!await IsAdminAuthenticated())
            return Forbid();

        if (dto is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";
            return BadRequest(_response);
        }

        try
        {
            int usuarioId;

            if (dto.EmNomeProprio)
            {
                usuarioId = await GetOrCreateAdminOperationalUserId();
            }
            else
            {
                if (!dto.UsuarioId.HasValue || dto.UsuarioId.Value <= 0)
                {
                    _response.Code = ResponseEnum.INVALID;
                    _response.Data = null;
                    _response.Message = "Informe um usuário válido para criar o pedido.";
                    return BadRequest(_response);
                }

                var exists = await _context.Usuarios.AnyAsync(u => u.Id == dto.UsuarioId.Value);
                if (!exists)
                {
                    _response.Code = ResponseEnum.NOT_FOUND;
                    _response.Data = null;
                    _response.Message = "Usuário não encontrado.";
                    return NotFound(_response);
                }

                usuarioId = dto.UsuarioId.Value;
            }

            var pedidoDTO = new PedidoDTO
            {
                UsuarioId = usuarioId,
                DataPedido = dto.DataPedido ?? DateTime.UtcNow
            };

            var id = await _pedidoService.CreateAndReturnId(pedidoDTO);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = new { id, usuarioId };
            _response.Message = "Pedido cadastrado com sucesso";
            return Ok(_response);
        }
        catch (ArgumentException ex)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = ex.Message;
            return BadRequest(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar cadastrar o pedido";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };

            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    [HttpDelete("admin/{id}")]
    public async Task<IActionResult> CancelAdmin(int id)
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

    private async Task<int> GetOrCreateAdminOperationalUserId()
    {
        var adminEmail = User.Claims
            .FirstOrDefault(c => c.Type == ClaimTypes.Email || c.Type == JwtRegisteredClaimNames.Email)
            ?.Value;

        if (string.IsNullOrWhiteSpace(adminEmail))
            throw new ArgumentException("Administrador não autenticado.");

        var operationalEmail = $"admin.operacional+{adminEmail}".ToLowerInvariant();

        var existing = await _context.Usuarios.FirstOrDefaultAsync(u => u.Email == operationalEmail);
        if (existing is not null)
            return existing.Id;

        var usuario = new Usuario
        {
            Nome = "Admin Operacional",
            Telefone = "00000000000",
            Cep = "00000000",
            Uf = "SP",
            Cidade = "Sistema",
            Bairro = "Admin",
            Rua = "Operacional",
            Numero = 0,
            Email = operationalEmail,
            Senha = "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92"
        };

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync();

        return usuario.Id;
    }
}
