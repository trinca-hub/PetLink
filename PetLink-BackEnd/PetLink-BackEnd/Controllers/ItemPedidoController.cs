using Microsoft.AspNetCore.Mvc;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class ItemPedidoController : Controller
{
    private readonly IItemPedidoService _itempedidoService;
    private readonly Response _response;

    public ItemPedidoController(IItemPedidoService itempedidoService)
    {
        _itempedidoService = itempedidoService;
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
            _response.Message = " cadastrado com sucesso";

            return Ok(_response);
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

            await _itempedidoService.Remove(id);

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
}