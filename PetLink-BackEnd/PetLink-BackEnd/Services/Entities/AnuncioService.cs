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

    public async Task UpdateDescricao(int anuncioId, string descricao)
    {
        if (string.IsNullOrWhiteSpace(descricao))
            throw new ArgumentException("Descrição é obrigatória.");

        var anuncio = await _context.Anuncios
            .FirstOrDefaultAsync(a => a.Id == anuncioId);

        if (anuncio == null)
            throw new ArgumentException("Anúncio não existe.");

        // ✅ só muda descrição
        anuncio.Descricao = descricao.Trim();

        await _context.SaveChangesAsync();
    }

    public async Task UpdatePetFinder(int anuncioId, EditarPetFinderDTO dto)
    {
        if (dto == null)
            throw new ArgumentException("DTO é obrigatório.");

        if (string.IsNullOrWhiteSpace(dto.UltimoLocalVisto))
            throw new ArgumentException("UltimoLocalVisto é obrigatório.");

        if (dto.DataDesaparecimento == default)
            throw new ArgumentException("DataDesaparecimento é obrigatória.");

        // ✅ valida se o anúncio é PetFinder
        var anuncio = await _context.Anuncios
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == anuncioId);

        if (anuncio == null)
            throw new ArgumentException("Anúncio não existe.");

        if (anuncio.TipoAnuncio != TipoAnuncio.PETFINDER)
            throw new ArgumentException("Este anúncio não é do tipo PetFinder.");

        // ✅ pega a tabela do subtipo e atualiza
        var pf = await _context.AnunciosPetFinder
            .FirstOrDefaultAsync(x => x.AnuncioId == anuncioId);

        if (pf == null)
            throw new ArgumentException("Registro PetFinder não encontrado para este anúncio.");

        pf.UltimoLocalVisto = dto.UltimoLocalVisto.Trim();
        pf.DataDesaparecimento = DateTime.SpecifyKind(dto.DataDesaparecimento, DateTimeKind.Utc);

        await _context.SaveChangesAsync();
    }

    public async Task UpdatePayPet(int anuncioId, EditarPayPetDTO dto)
    {
        if (dto == null)
            throw new ArgumentException("DTO é obrigatório.");

        // 1=ADOCAO/DOACAO, 2=VENDA
        var isDoacao = dto.TipoPayPet == 1;
        var isVenda = dto.TipoPayPet == 2;

        if (!isDoacao && !isVenda)
            throw new ArgumentException("TipoPayPet inválido.");

        if (isVenda && (dto.Valor == null || dto.Valor <= 0))
            throw new ArgumentException("Para venda, informe um valor maior que 0.");

        // ✅ valida se o anúncio é PayPet
        var anuncio = await _context.Anuncios
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == anuncioId);

        if (anuncio == null)
            throw new ArgumentException("Anúncio não existe.");

        if (anuncio.TipoAnuncio != TipoAnuncio.PAYPET)
            throw new ArgumentException("Este anúncio não é do tipo PayPet.");

        // ✅ pega a tabela do subtipo e atualiza
        var pp = await _context.AnunciosPayPet
            .FirstOrDefaultAsync(x => x.AnuncioId == anuncioId);

        if (pp == null)
            throw new ArgumentException("Registro PayPet não encontrado para este anúncio.");

        pp.TipoPayPet = (TipoPayPet)dto.TipoPayPet;

        // se doação, zera valor (pra não ficar lixo no banco)
        pp.Valor = isDoacao ? 0 : dto.Valor!.Value;

        await _context.SaveChangesAsync();
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
