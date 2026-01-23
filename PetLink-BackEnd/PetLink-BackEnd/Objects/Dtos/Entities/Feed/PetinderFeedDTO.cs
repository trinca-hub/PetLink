namespace PetLink_BackEnd.Objects.Dtos.Entities;

public class PetinderFeedDTO
{
    public int AnuncioId { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; }

    public string? FotoPet { get; set; }
    public string NomePet { get; set; } = string.Empty;
    public int IdadePet { get; set; }
    public string SexoPet { get; set; } = string.Empty;
    public string RacaPet { get; set; } = string.Empty;

    public string NomeUsuario { get; set; } = string.Empty;
    public string TelefoneUsuario { get; set; } = string.Empty;

    public string Cidade { get; set; } = string.Empty;
    public string Uf { get; set; } = string.Empty;
    public string Bairro { get; set; } = string.Empty;
    public string Rua { get; set; } = string.Empty;
    public int Numero { get; set; }
}
