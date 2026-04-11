namespace PetLink_BackEnd.Objects.Dtos.Entities;

public class AdminAnuncioFeedDTO
{
    public int AnuncioId { get; set; }
    public int TipoAnuncio { get; set; }
    public string TipoAnuncioLabel { get; set; } = string.Empty;
    public string Descricao { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; }

    public string? FotoPet { get; set; }
    public string NomePet { get; set; } = string.Empty;
    public string IdadePet { get; set; } = string.Empty;
    public string SexoPet { get; set; } = string.Empty;
    public string RacaPet { get; set; } = string.Empty;
    public string TipoPet { get; set; } = string.Empty;

    public int UsuarioId { get; set; }
    public string NomeUsuario { get; set; } = string.Empty;
    public string TelefoneUsuario { get; set; } = string.Empty;
    public string Cidade { get; set; } = string.Empty;
    public string Uf { get; set; } = string.Empty;
    public string Bairro { get; set; } = string.Empty;
    public string Rua { get; set; } = string.Empty;
    public int Numero { get; set; }

    public string? UltimoLocalVisto { get; set; }
    public DateTime? DataDesaparecimento { get; set; }

    public int? TipoPayPet { get; set; }
    public decimal? Valor { get; set; }
}
