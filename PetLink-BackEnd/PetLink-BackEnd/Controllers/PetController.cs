using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Services.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace PetLink_BackEnd.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize] // garante que todos os endpoints exigem token
public class PetController : Controller
{
    private readonly IPetService _petService;
    private readonly IUsuarioService _usuarioService;
    private readonly Response _response;

    public PetController(IPetService petService, IUsuarioService usuarioService)
    {
        _petService = petService;
        _usuarioService = usuarioService;
        _response = new Response();
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var petsDTO = await _petService.GetAll();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = petsDTO;
        _response.Message = "Pets listados com sucesso";

        return Ok(_response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var petDTO = await _petService.GetById(id);

        if (petDTO is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "Pet não encontrado";

            return NotFound(_response);
        }

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = petDTO;
        _response.Message = "Pet listado com sucesso";

        return Ok(_response);
    }

    [HttpGet("usuario/{usuarioId}")]
    public async Task<IActionResult> GetByUsuarioId(int usuarioId)
    {
        var petsDTO = await _petService.GetByUsuarioId(usuarioId);

        if (petsDTO == null || !petsDTO.Any())
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "Nenhum pet encontrado para este usuário";
            return NotFound(_response);
        }

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = petsDTO;
        _response.Message = "Pets listados com sucesso";

        return Ok(_response);
    }

    [HttpPost]
    public async Task<IActionResult> Post(PetDTO petDTO)
    {
        if (petDTO is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";
            return BadRequest(_response);
        }

        try
        {
            petDTO.Id = 0;
            await _petService.Create(petDTO);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = petDTO;
            _response.Message = "Pet cadastrado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Erro ao cadastrar pet";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace
            };

            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, PetDTO petDTO)
    {
        if (petDTO is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        try
        {
            var existingPetDTO = await _petService.GetById(id);
            if (existingPetDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "Pet não encontrado";

                return NotFound(_response);
            }

            await _petService.Update(petDTO, id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = petDTO;
            _response.Message = "Pet atualizado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Erro ao atualizar pet";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace
            };

            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var existingPetDTO = await _petService.GetById(id);
            if (existingPetDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Message = "Pet não encontrado";
                return NotFound(_response);
            }

            await _petService.Remove(id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = null;
            _response.Message = "Pet removido com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Erro ao remover pet";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace
            };

            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }

    // 🔐 NOVO ENDPOINT: retorna apenas os pets do usuário logado
    [HttpGet("meus")]
    public async Task<IActionResult> GetMeusPets()
    {
        var email = User.Claims.FirstOrDefault(c =>
            c.Type == ClaimTypes.Email || c.Type == JwtRegisteredClaimNames.Email)?.Value;

        if (string.IsNullOrEmpty(email))
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Message = "Token inválido";
            return Unauthorized(_response);
        }

        var usuario = await _usuarioService.GetByEmail(email);

        if (usuario is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Message = "Usuário não encontrado";
            return NotFound(_response);
        }

        var pets = await _petService.GetByUsuarioId(usuario.Id);

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = pets;
        _response.Message = "Pets do usuário listados com sucesso";

        return Ok(_response);
    }
}
