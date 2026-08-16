using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Controllers;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class EnderecoUsuarioController : Controller
{
    private readonly AppDbContext _context;
    private readonly Response _response;

    public EnderecoUsuarioController(AppDbContext context)
    {
        _context = context;
        _response = new Response();
    }

    [HttpGet("usuario/{usuarioId}")]
    public async Task<IActionResult> GetByUsuarioId(int usuarioId)
    {
        var enderecos = await _context.EnderecosUsuarios
            .Where(e => e.UsuarioId == usuarioId && e.Ativo)
            .OrderByDescending(e => e.Principal)
            .ThenByDescending(e => e.CriadoEm)
            .Select(e => ToDto(e))
            .ToListAsync();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = enderecos;
        _response.Message = "Endereços listados com sucesso";

        return Ok(_response);
    }

    [HttpPost]
    public async Task<IActionResult> Post(EnderecoUsuarioDTO dto)
    {
        if (!IsValid(dto, out var message))
            return Invalid(message);

        var usuarioExiste = await _context.Usuarios.AnyAsync(u => u.Id == dto.UsuarioId);
        if (!usuarioExiste)
            return Invalid("Usuário não encontrado.");

        var temEndereco = await _context.EnderecosUsuarios.AnyAsync(e => e.UsuarioId == dto.UsuarioId && e.Ativo);
        var deveSerPrincipal = dto.Principal || !temEndereco;

        await using var tx = await _context.Database.BeginTransactionAsync();

        if (deveSerPrincipal)
            await ClearPrincipal(dto.UsuarioId);

        var entity = FromDto(dto);
        entity.Id = 0;
        entity.Principal = deveSerPrincipal;
        entity.Ativo = true;
        entity.CriadoEm = DateTime.UtcNow;

        _context.EnderecosUsuarios.Add(entity);
        await _context.SaveChangesAsync();
        await tx.CommitAsync();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = ToDto(entity);
        _response.Message = "Endereço cadastrado com sucesso";

        return Ok(_response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Put(int id, EnderecoUsuarioDTO dto)
    {
        if (!IsValid(dto, out var message))
            return Invalid(message);

        var entity = await _context.EnderecosUsuarios.FirstOrDefaultAsync(e => e.Id == id && e.Ativo);
        if (entity is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "Endereço não encontrado";
            return NotFound(_response);
        }

        await using var tx = await _context.Database.BeginTransactionAsync();

        if (dto.Principal)
            await ClearPrincipal(entity.UsuarioId);

        entity.Apelido = Clean(dto.Apelido);
        entity.Destinatario = Clean(dto.Destinatario);
        entity.Telefone = OnlyDigits(dto.Telefone);
        entity.Cep = OnlyDigits(dto.Cep);
        entity.Uf = Clean(dto.Uf).ToUpperInvariant();
        entity.Cidade = Clean(dto.Cidade);
        entity.Bairro = Clean(dto.Bairro);
        entity.Rua = Clean(dto.Rua);
        entity.Numero = dto.Numero;
        entity.Complemento = Clean(dto.Complemento);
        entity.Referencia = Clean(dto.Referencia);
        entity.Principal = dto.Principal || entity.Principal;

        await _context.SaveChangesAsync();
        await tx.CommitAsync();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = ToDto(entity);
        _response.Message = "Endereço atualizado com sucesso";

        return Ok(_response);
    }

    [HttpPut("{id}/principal")]
    public async Task<IActionResult> SetPrincipal(int id)
    {
        var entity = await _context.EnderecosUsuarios.FirstOrDefaultAsync(e => e.Id == id && e.Ativo);
        if (entity is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "Endereço não encontrado";
            return NotFound(_response);
        }

        await using var tx = await _context.Database.BeginTransactionAsync();
        await ClearPrincipal(entity.UsuarioId);
        entity.Principal = true;
        await _context.SaveChangesAsync();
        await tx.CommitAsync();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = ToDto(entity);
        _response.Message = "Endereço principal atualizado com sucesso";

        return Ok(_response);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var entity = await _context.EnderecosUsuarios.FirstOrDefaultAsync(e => e.Id == id && e.Ativo);
        if (entity is null)
        {
            _response.Code = ResponseEnum.NOT_FOUND;
            _response.Data = null;
            _response.Message = "Endereço não encontrado";
            return NotFound(_response);
        }

        entity.Ativo = false;
        entity.Principal = false;
        await _context.SaveChangesAsync();

        _response.Code = ResponseEnum.SUCCESS;
        _response.Data = null;
        _response.Message = "Endereço removido com sucesso";

        return Ok(_response);
    }

    private async Task ClearPrincipal(int usuarioId)
    {
        var principais = await _context.EnderecosUsuarios
            .Where(e => e.UsuarioId == usuarioId && e.Principal)
            .ToListAsync();

        foreach (var item in principais)
            item.Principal = false;
    }

    private IActionResult Invalid(string message)
    {
        _response.Code = ResponseEnum.INVALID;
        _response.Data = null;
        _response.Message = message;
        return BadRequest(_response);
    }

    private static bool IsValid(EnderecoUsuarioDTO dto, out string message)
    {
        if (dto is null)
        {
            message = "Dados inválidos.";
            return false;
        }

        if (dto.UsuarioId <= 0)
        {
            message = "Usuário inválido.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(dto.Cep) ||
            string.IsNullOrWhiteSpace(dto.Uf) ||
            string.IsNullOrWhiteSpace(dto.Cidade) ||
            string.IsNullOrWhiteSpace(dto.Bairro) ||
            string.IsNullOrWhiteSpace(dto.Rua) ||
            dto.Numero <= 0)
        {
            message = "Informe CEP, UF, cidade, bairro, rua e número.";
            return false;
        }

        message = string.Empty;
        return true;
    }

    private static EnderecoUsuario FromDto(EnderecoUsuarioDTO dto)
    {
        return new EnderecoUsuario
        {
            UsuarioId = dto.UsuarioId,
            Apelido = string.IsNullOrWhiteSpace(dto.Apelido) ? "Entrega" : Clean(dto.Apelido),
            Destinatario = Clean(dto.Destinatario),
            Telefone = OnlyDigits(dto.Telefone),
            Cep = OnlyDigits(dto.Cep),
            Uf = Clean(dto.Uf).ToUpperInvariant(),
            Cidade = Clean(dto.Cidade),
            Bairro = Clean(dto.Bairro),
            Rua = Clean(dto.Rua),
            Numero = dto.Numero,
            Complemento = Clean(dto.Complemento),
            Referencia = Clean(dto.Referencia),
            Principal = dto.Principal,
            Ativo = dto.Ativo,
            CriadoEm = dto.CriadoEm == default ? DateTime.UtcNow : DateTime.SpecifyKind(dto.CriadoEm, DateTimeKind.Utc)
        };
    }

    private static EnderecoUsuarioDTO ToDto(EnderecoUsuario entity)
    {
        return new EnderecoUsuarioDTO
        {
            Id = entity.Id,
            UsuarioId = entity.UsuarioId,
            Apelido = entity.Apelido,
            Destinatario = entity.Destinatario,
            Telefone = entity.Telefone,
            Cep = entity.Cep,
            Uf = entity.Uf,
            Cidade = entity.Cidade,
            Bairro = entity.Bairro,
            Rua = entity.Rua,
            Numero = entity.Numero,
            Complemento = entity.Complemento,
            Referencia = entity.Referencia,
            Principal = entity.Principal,
            Ativo = entity.Ativo,
            CriadoEm = entity.CriadoEm
        };
    }

    private static string Clean(string value) => (value ?? string.Empty).Trim();

    private static string OnlyDigits(string value)
    {
        return new string(Clean(value).Where(char.IsDigit).ToArray());
    }
}
