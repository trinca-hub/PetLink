using Microsoft.AspNetCore.Mvc;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
public class AnuncioController : Controller
{
    private readonly IAnuncioService _anuncioService;
    private readonly Response _response;

    public AnuncioController(IAnuncioService anuncioService)
    {
        _anuncioService = anuncioService;
        _response = new Response();
    }

    // =========================
    // FEEDS (RETORNO COMPLETO)
    // =========================

    [HttpGet("feed/petinder")]
    public async Task<IActionResult> FeedPetinder()
    {
        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = await _anuncioService.GetFeedPetinder();
        _response.Message = "Feed Petinder listado com sucesso";
        return Ok(_response);
    }

    [HttpGet("feed/petfinder")]
    public async Task<IActionResult> FeedPetfinder()
    {
        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = await _anuncioService.GetFeedPetfinder();
        _response.Message = "Feed Petfinder listado com sucesso";
        return Ok(_response);
    }

    [HttpGet("feed/paypet")]
    public async Task<IActionResult> FeedPaypet()
    {
        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = await _anuncioService.GetFeedPaypet();
        _response.Message = "Feed PayPet listado com sucesso";
        return Ok(_response);
    }

    [HttpGet("feed/petshop")]
    public async Task<IActionResult> FeedPetshop()
    {
        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = await _anuncioService.GetFeedPetshop();
        _response.Message = "Feed Petshop listado com sucesso";
        return Ok(_response);
    }


    // =========================
    // CRUD BASE (ANUNCIO)
    // =========================

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var anunciosDTO = await _anuncioService.GetAll();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = anunciosDTO;
        _response.Message = "Anúncios listados com sucesso";

        return Ok(_response);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var anuncioDTO = await _anuncioService.GetById(id);

        if (anuncioDTO is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "Anúncio não encontrado";

            return NotFound(_response);
        }

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = anuncioDTO;
        _response.Message = "Anúncio listado com sucesso";

        return Ok(_response);
    }

    // ✅ POST UNIFICADO (cria base + subtipo)
    [HttpPost]
    public async Task<IActionResult> Post(CriarAnuncioDTO dto)
    {
        if (dto is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        try
        {
            var id = await _anuncioService.CreateCompleto(dto);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = new { Id = id };
            _response.Message = "Anúncio cadastrado com sucesso";

            return Ok(_response);
        }
        catch (ArgumentException ex)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Message = ex.Message;
            _response.Data = null;
            return BadRequest(_response);
        }
        catch (Exception ex)
        {
            var baseEx = ex.GetBaseException();

            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Erro do caraio fdp (só mudei pra ver se é o erro genérico mesmo)";
            _response.Data = new
            {
                ErrorMessage = baseEx.Message,
                Inner = ex.InnerException?.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };

            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }

    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, AnuncioDTO anuncioDTO)
    {
        if (anuncioDTO is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados inválidos";

            return BadRequest(_response);
        }

        try
        {
            var existingAnuncioDTO = await _anuncioService.GetById(id);
            if (existingAnuncioDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O anúncio informado não existe";
                return NotFound(_response);
            }

            // opcional: impedir troca de tipo via PUT (recomendado)
            // anuncioDTO.TipoAnuncio = existingAnuncioDTO.TipoAnuncio;

            await _anuncioService.Update(anuncioDTO, id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = anuncioDTO;
            _response.Message = "Anúncio atualizado com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar atualizar os dados do anúncio";
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
            var existingAnuncioDTO = await _anuncioService.GetById(id);
            if (existingAnuncioDTO is null)
            {
                _response.Code = ResponseEnum.NOT_FOUND;
                _response.Data = null;
                _response.Message = "O anúncio informado não existe";
                return NotFound(_response);
            }

            await _anuncioService.Remove(id);

            _response.Code = ResponseEnum.SUCCESS;
            _response.Data = null;
            _response.Message = "Anúncio removido com sucesso";

            return Ok(_response);
        }
        catch (Exception ex)
        {
            _response.Code = ResponseEnum.ERROR;
            _response.Message = "Ocorreu um erro ao tentar remover o anúncio";
            _response.Data = new
            {
                ErrorMessage = ex.Message,
                StackTrace = ex.StackTrace ?? "No stack trace available"
            };
            return StatusCode(StatusCodes.Status500InternalServerError, _response);
        }
    }
}
