using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize]
public class ItemPedidoController : Controller
{
    private readonly IItemPedidoService _itempedidoService;
    private readonly IAdministradorService _administradorService;
    private readonly Response _response;

    public ItemPedidoController(
        IItemPedidoService itempedidoService,
        IAdministradorService administradorService)
    {
        _itempedidoService = itempedidoService;
        _administradorService = administradorService;
        _response = new Response();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var itempedidosDTO = await _itempedidoService.GetAll();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = itempedidosDTO;
        _response.Message = "Itens do pedido listados com sucesso";

        return Ok(_response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var itempedidoDTO = await _itempedidoService.GetById(id);

        if (itempedidoDTO is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "Item do pedido não encontrado";

            return NotFound(_response);
        }

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = itempedidoDTO;
        _response.Message = "Item do pedido listado com sucesso";

        return Ok(_response);
    }

    [HttpGet("pedido/{pedidoId}")]
    public async Task<IActionResult> GetByPedidoId(int pedidoId)
    {
        var itensDTO = await _itempedidoService.GetByPedidoId(pedidoId);

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = itensDTO;
        _response.Message = "Itens do pedido listados com sucesso";

        return Ok(_response);
    }

    [HttpPost]
    public async Task<IActionResult> Post(ItemPedidoDTO itempedidoDTO)
    {
        if (itempedidoDTO is null)
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
            itempedidoDTO.Id = 0;
            await _itempedidoService.Create(itempedidoDTO);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = itempedidoDTO;
            _response.Message = "Item do pedido cadastrado com sucesso";

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
            _response.Message = "Não foi possível cadastrar o item do pedido";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };
            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, ItemPedidoDTO itempedidoDTO)
    {
        if (itempedidoDTO is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        try
        {
            var existingItemPedidoDTO = await _itempedidoService.GetById(id);
            if (existingItemPedidoDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O item do pedido informado não existe";
                return NotFound(_response);
            }

            await _itempedidoService.Update(itempedidoDTO, id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = itempedidoDTO;
            _response.Message = "Item do pedido atualizado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar atualizar os dados do item do pedido";
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
            var existingItemPedidoDTO = await _itempedidoService.GetById(id);
            if (existingItemPedidoDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O item do pedido informado não existe";
                return NotFound(_response);
            }

            await _itempedidoService.RemoveWithRestock(id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = null;
            _response.Message = "Item do pedido removido com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar remover o item do pedido";
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

    [HttpGet("admin/pedido/{pedidoId}")]
    public async Task<IActionResult> GetByPedidoIdAdmin(int pedidoId)
    {
        if (!await IsAdminAuthenticated())
            return Forbid();

        return await GetByPedidoId(pedidoId);
    }

    [HttpPost("admin")]
    public async Task<IActionResult> PostAdmin(ItemPedidoDTO itempedidoDTO)
    {
        if (!await IsAdminAuthenticated())
            return Forbid();

        return await Post(itempedidoDTO);
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