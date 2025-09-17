using Microsoft.AspNetCore.Mvc;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class VeterinarioController : Controller
{
    private readonly IVeterinarioService _veterinarioService;
    private readonly Response _response;

    public VeterinarioController(IVeterinarioService veterinarioService)
    {
        _veterinarioService = veterinarioService;
        _response = new Response();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var veterinariosDTO = await _veterinarioService.GetAll();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = veterinariosDTO;
        _response.Message = "Veterinarios(as) listados com sucesso";

        return Ok(_response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var veterinarioDTO = await _veterinarioService.GetById(id);

        if (veterinarioDTO is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "Veterinario(a) não encontrado";

            return NotFound(_response);
        }

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = veterinarioDTO;
        _response.Message = "Veterinario(a) listado com sucesso";

        return Ok(_response);
    }

    [HttpPost]
    public async Task<IActionResult> Post(VeterinarioDTO veterinarioDTO)
    {
        if (veterinarioDTO is null)
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
            veterinarioDTO.Id = 0;
            await _veterinarioService.Create(veterinarioDTO);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = veterinarioDTO;
            _response.Message = " cadastrado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Não foi possível cadastrar o veterinario(a)";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };
            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, VeterinarioDTO veterinarioDTO)
    {
        if (veterinarioDTO is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        try
        {
            var existingVeterinarioDTO = await _veterinarioService.GetById(id);
            if (existingVeterinarioDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O(a) veterinario(a) informado não existe";
                return NotFound(_response);
            }

            await _veterinarioService.Update(veterinarioDTO, id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = veterinarioDTO;
            _response.Message = "Veterinario(a) atualizado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar atualizar os dados do(a) veterinario(a)";
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
            var existingVeterinarioDTO = await _veterinarioService.GetById(id);
            if (existingVeterinarioDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O(a) veterinario(a) informado não existe";
                return NotFound(_response);
            }

            await _veterinarioService.Remove(id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = null;
            _response.Message = "Veterinario(a) removido com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar remover o(a) veterinario(a)";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };
            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }
}