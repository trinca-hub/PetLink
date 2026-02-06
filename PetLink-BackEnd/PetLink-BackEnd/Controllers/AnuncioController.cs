using Microsoft.AspNetCore.Mvc;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Services.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

namespace PetLink_BackEnd.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
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
    // Helper: userId do token
    // =========================
    private int? GetUserIdFromToken()
    {
        var idStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(idStr, out var id) ? id : null;
    }


    private IActionResult UnauthorizedResponse()
    {
        _response.Code = ResponseEnum.INVALID;
        _response.Data = null;
        _response.Message = "Usuário não autenticado";
        return Unauthorized(_response);
    }

    private IActionResult ForbiddenResponse(string msg)
    {
        _response.Code = ResponseEnum.INVALID;
        _response.Data = null;
        _response.Message = msg;
        return StatusCode(StatusCodes.Status403Forbidden, _response);
    }

    // =========================
    // FEEDS (RETORNO COMPLETO)
    // =========================

    [HttpGet("feed/petinder")]
    [AllowAnonymous]
    public async Task<IActionResult> FeedPetinder()
    {
        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = await _anuncioService.GetFeedPetinder();
        _response.Message = "Feed Petinder listado com sucesso";
        return Ok(_response);
    }

    [HttpGet("feed/petfinder")]
    [AllowAnonymous]
    public async Task<IActionResult> FeedPetfinder()
    {
        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = await _anuncioService.GetFeedPetfinder();
        _response.Message = "Feed Petfinder listado com sucesso";
        return Ok(_response);
    }

    [HttpGet("feed/paypet")]
    [AllowAnonymous]
    public async Task<IActionResult> FeedPaypet()
    {
        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = await _anuncioService.GetFeedPaypet();
        _response.Message = "Feed PayPet listado com sucesso";
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

        var userId = GetUserIdFromToken();
        if (userId == null) return UnauthorizedResponse();

        try
        {
            // ✅ força dono pelo token (não confia no front)
            dto.UsuarioId = userId.Value;
            dto.CriadorId = userId.Value;

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
            _response.Message = "Erro ao criar anúncio";
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
    public async Task<IActionResult> Put(int id, [FromBody] AnuncioDTO anuncioDTO)
    {
        if (anuncioDTO is null || string.IsNullOrWhiteSpace(anuncioDTO.Descricao))
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Descrição inválida";
            return BadRequest(_response);
        }

        var userId = GetUserIdFromToken();
        if (userId == null) return UnauthorizedResponse();

        var existing = await _anuncioService.GetById(id);
        if (existing is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "O anúncio informado não existe";
            return NotFound(_response);
        }

        if (existing.UsuarioId != userId.Value)
            return ForbiddenResponse("Você não tem permissão para editar este anúncio");

        await _anuncioService.UpdateDescricao(id, anuncioDTO.Descricao.Trim());

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = null;
        _response.Message = "Descrição atualizada com sucesso";
        return Ok(_response);
    }


    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserIdFromToken();
        if (userId == null) return UnauthorizedResponse();

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

            // ✅ só o dono exclui
            // (se no seu projeto for CriadorId, troque aqui)
            if (existingAnuncioDTO.UsuarioId != userId.Value)
                return ForbiddenResponse("Você não tem permissão para excluir este anúncio");

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

    [HttpPut("{id}/petfinder")]
    public async Task<IActionResult> PutPetFinder(int id, [FromBody] EditarPetFinderDTO dto)
    {
        if (dto is null || string.IsNullOrWhiteSpace(dto.UltimoLocalVisto) || dto.DataDesaparecimento == default)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados do PetFinder inválidos";
            return BadRequest(_response);
        }

        var userId = GetUserIdFromToken();
        if (userId == null) return UnauthorizedResponse();

        var existing = await _anuncioService.GetById(id);
        if (existing is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "O anúncio informado não existe";
            return NotFound(_response);
        }

        if (existing.UsuarioId != userId.Value)
            return ForbiddenResponse("Você não tem permissão para editar este anúncio");

        await _anuncioService.UpdatePetFinder(id, dto);

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = null;
        _response.Message = "PetFinder atualizado com sucesso";
        return Ok(_response);
    }

    [HttpPut("{id}/paypet")]
    public async Task<IActionResult> PutPayPet(int id, [FromBody] EditarPayPetDTO dto)
    {
        if (dto is null)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Dados do PayPet inválidos";
            return BadRequest(_response);
        }

        // validação: doação => valor null ou 0; venda => valor obrigatório > 0
        var isDoacao = dto.TipoPayPet == 1;
        var isVenda = dto.TipoPayPet == 2;

        if (!isDoacao && !isVenda)
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "TipoPayPet inválido";
            return BadRequest(_response);
        }

        if (isVenda && (dto.Valor == null || dto.Valor <= 0))
        {
            _response.Code = ResponseEnum.INVALID;
            _response.Data = null;
            _response.Message = "Para venda, informe um valor maior que 0";
            return BadRequest(_response);
        }

        var userId = GetUserIdFromToken();
        if (userId == null) return UnauthorizedResponse();

        var existing = await _anuncioService.GetById(id);
        if (existing is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "O anúncio informado não existe";
            return NotFound(_response);
        }

        if (existing.UsuarioId != userId.Value)
            return ForbiddenResponse("Você não tem permissão para editar este anúncio");

        await _anuncioService.UpdatePayPet(id, dto);

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = null;
        _response.Message = "PayPet atualizado com sucesso";
        return Ok(_response);
    }

}
