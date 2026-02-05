using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Enums;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities;

public class AnuncioService : GenericService<Anuncio, AnuncioDTO>, IAnuncioService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public AnuncioService(IAnuncioRepository anuncioRepo, IMapper mapper, AppDbContext context)
        : base(anuncioRepo, mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<int> CreateCompleto(CriarAnuncioDTO dto)
    {
        if (dto is null) throw new ArgumentException("DTO é obrigatório.");
        if (string.IsNullOrWhiteSpace(dto.Descricao)) throw new ArgumentException("Descricao é obrigatória.");

        var tipo = (TipoAnuncio)dto.TipoAnuncio;

        // valida "1 subtipo certo"
        ValidarPayloadPorTipo(tipo, dto);

        // usuario obrigatório pros 3 tipos restantes
        if (dto.UsuarioId is null || dto.UsuarioId <= 0)
            throw new ArgumentException("UsuarioId é obrigatório para esse tipo de anúncio.");

        // valida se usuario existe
        if (!await _context.Usuarios.AnyAsync(u => u.Id == dto.UsuarioId.Value))
            throw new ArgumentException("UsuarioId não existe.");

        // valida FKs por tipo (evita 500)
        if (tipo == TipoAnuncio.PETINDER && !await _context.Pets.AnyAsync(p => p.Id == dto.PeTinder!.PetId))
            throw new ArgumentException("PetId não existe.");

        if (tipo == TipoAnuncio.PETFINDER && !await _context.Pets.AnyAsync(p => p.Id == dto.PetFinder!.PetId))
            throw new ArgumentException("PetId não existe.");

        if (tipo == TipoAnuncio.PAYPET && !await _context.Pets.AnyAsync(p => p.Id == dto.PayPet!.PetId))
            throw new ArgumentException("PetId não existe.");

        // valida se pet é do usuario (quando for anúncio com pet)
        if (tipo is TipoAnuncio.PETINDER or TipoAnuncio.PETFINDER or TipoAnuncio.PAYPET)
        {
            var petId = tipo switch
            {
                TipoAnuncio.PETINDER => dto.PeTinder!.PetId,
                TipoAnuncio.PETFINDER => dto.PetFinder!.PetId,
                _ => dto.PayPet!.PetId
            };

            var petEhDoUsuario = await _context.Pets.AnyAsync(p => p.Id == petId && p.UsuarioId == dto.UsuarioId.Value);
            if (!petEhDoUsuario)
                throw new ArgumentException("Esse PetId não pertence a esse UsuarioId.");
        }

        using var trx = await _context.Database.BeginTransactionAsync();

        // ✅ cria base (só usuário)
        var anuncio = new Anuncio
        {
            Descricao = dto.Descricao,
            TipoAnuncio = tipo,
            DataCriacao = DateTime.UtcNow,

            OrigemEndereco = OrigemEndereco.USUARIO,
            CriadorTipo = CriadorAnuncio.USUARIO,
            CriadorId = dto.UsuarioId.Value,

            UsuarioId = dto.UsuarioId.Value
        };

        _context.Anuncios.Add(anuncio);
        await _context.SaveChangesAsync(); // anuncio.Id existe

        // ✅ cria subtipo (só 3 tipos)
        switch (tipo)
        {
            case TipoAnuncio.PAYPET:
                _context.AnunciosPayPet.Add(new AnuncioPayPet
                {
                    AnuncioId = anuncio.Id,
                    PetId = dto.PayPet!.PetId,
                    TipoPayPet = (TipoPayPet)dto.PayPet!.TipoPayPet,
                    Valor = dto.PayPet!.Valor
                });
                break;

            case TipoAnuncio.PETFINDER:
                _context.AnunciosPetFinder.Add(new AnuncioPetFinder
                {
                    AnuncioId = anuncio.Id,
                    PetId = dto.PetFinder!.PetId,
                    UltimoLocalVisto = dto.PetFinder!.UltimoLocalVisto,
                    DataDesaparecimento = DateTime.SpecifyKind(dto.PetFinder!.DataDesaparecimento, DateTimeKind.Utc)
                });
                break;

            case TipoAnuncio.PETINDER:
                _context.AnunciosPeTinder.Add(new AnuncioPeTinder
                {
                    AnuncioId = anuncio.Id,
                    PetId = dto.PeTinder!.PetId
                });
                break;

            default:
                throw new ArgumentException("TipoAnuncio inválido para este endpoint.");
        }

        await _context.SaveChangesAsync();
        await trx.CommitAsync();

        return anuncio.Id;
    }

    private static void ValidarPayloadPorTipo(TipoAnuncio tipo, CriarAnuncioDTO dto)
    {
        // Só 3 blocos agora
        var count =
            (dto.PayPet != null ? 1 : 0) +
            (dto.PetFinder != null ? 1 : 0) +
            (dto.PeTinder != null ? 1 : 0);

        if (count != 1)
            throw new ArgumentException("Envie exatamente um bloco de dados: PayPet, PetFinder ou PeTinder.");

        switch (tipo)
        {
            case TipoAnuncio.PAYPET:
                if (dto.PayPet == null) throw new ArgumentException("PayPet é obrigatório para TipoAnuncio=PAYPET.");
                break;

            case TipoAnuncio.PETFINDER:
                if (dto.PetFinder == null) throw new ArgumentException("PetFinder é obrigatório para TipoAnuncio=PETFINDER.");
                break;

            case TipoAnuncio.PETINDER:
                if (dto.PeTinder == null) throw new ArgumentException("PeTinder é obrigatório para TipoAnuncio=PETINDER.");
                break;

            default:
                throw new ArgumentException("TipoAnuncio inválido para este endpoint.");
        }
    }

    public async Task<IEnumerable<PetinderFeedDTO>> GetFeedPetinder()
    {
        return await _context.AnunciosPeTinder
            .AsNoTracking()
            .Select(x => new PetinderFeedDTO
            {
                AnuncioId = x.AnuncioId,
                Descricao = x.Anuncio.Descricao,
                DataCriacao = x.Anuncio.DataCriacao,

                FotoPet = x.Pet.Foto,
                NomePet = x.Pet.Nome,
                IdadePet = x.Pet.Idade,
                SexoPet = x.Pet.Sexo,
                RacaPet = x.Pet.Raca,
                TipoPet = x.Pet.TipoPet.ToString(),

                NomeUsuario = x.Anuncio.Usuario!.Nome,
                TelefoneUsuario = x.Anuncio.Usuario!.Telefone,
                Cidade = x.Anuncio.Usuario!.Cidade,
                Uf = x.Anuncio.Usuario!.Uf,
                Bairro = x.Anuncio.Usuario!.Bairro,
                Rua = x.Anuncio.Usuario!.Rua,
                Numero = x.Anuncio.Usuario!.Numero
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<PetfinderFeedDTO>> GetFeedPetfinder()
    {
        return await _context.AnunciosPetFinder
            .AsNoTracking()
            .Select(x => new PetfinderFeedDTO
            {
                AnuncioId = x.AnuncioId,
                Descricao = x.Anuncio.Descricao,
                DataCriacao = x.Anuncio.DataCriacao,

                FotoPet = x.Pet.Foto,
                NomePet = x.Pet.Nome,
                RacaPet = x.Pet.Raca,
                IdadePet = x.Pet.Idade,
                SexoPet = x.Pet.Sexo,
                TipoPet = x.Pet.TipoPet.ToString(),

                UltimoLocalVisto = x.UltimoLocalVisto,
                DataDesaparecimento = x.DataDesaparecimento,

                NomeUsuario = x.Anuncio.Usuario!.Nome,
                TelefoneUsuario = x.Anuncio.Usuario!.Telefone,
                Cidade = x.Anuncio.Usuario!.Cidade,
                Uf = x.Anuncio.Usuario!.Uf,
                Bairro = x.Anuncio.Usuario!.Bairro,
                Rua = x.Anuncio.Usuario!.Rua,
                Numero = x.Anuncio.Usuario!.Numero
            })
            .ToListAsync();
    }

    public async Task<IEnumerable<PaypetFeedDTO>> GetFeedPaypet()
    {
        return await _context.AnunciosPayPet
            .AsNoTracking()
            .Select(x => new PaypetFeedDTO
            {
                AnuncioId = x.AnuncioId,
                Descricao = x.Anuncio.Descricao,
                DataCriacao = x.Anuncio.DataCriacao,

                FotoPet = x.Pet.Foto,
                NomePet = x.Pet.Nome,
                IdadePet = x.Pet.Idade,
                SexoPet = x.Pet.Sexo,
                RacaPet = x.Pet.Raca,
                TipoPet = x.Pet.TipoPet.ToString(),

                TipoPayPet = (int)x.TipoPayPet,
                Valor = x.Valor,

                NomeUsuario = x.Anuncio.Usuario!.Nome,
                TelefoneUsuario = x.Anuncio.Usuario!.Telefone,
                Cidade = x.Anuncio.Usuario!.Cidade,
                Uf = x.Anuncio.Usuario!.Uf,
                Bairro = x.Anuncio.Usuario!.Bairro,
                Rua = x.Anuncio.Usuario!.Rua,
                Numero = x.Anuncio.Usuario!.Numero
            })
            .ToListAsync();
    }
}
