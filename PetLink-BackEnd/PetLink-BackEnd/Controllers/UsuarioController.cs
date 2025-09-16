using Microsoft.AspNetCore.Mvc;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class UsuarioController : Controller
{
    private readonly IUsuarioService _usuarioService;
    private readonly Response _response;

    public UsuarioController(IUsuarioService usuarioService)
    {
        _usuarioService = usuarioService;
        _response = new Response();
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
}