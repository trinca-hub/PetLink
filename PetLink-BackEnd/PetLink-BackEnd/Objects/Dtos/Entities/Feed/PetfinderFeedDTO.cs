namespace PetLink_BackEnd.Objects.Dtos.Entities;

public class PetfinderFeedDTO
{
    public int AnuncioId { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; }

    public string? FotoPet { get; set; }
    public string NomePet { get; set; } = string.Empty;
    public string RacaPet { get; set; } = string.Empty;

    public string UltimoLocalVisto { get; set; } = string.Empty;
    public DateTime DataDesaparecimento { get; set; }

    public string NomeUsuario { get; set; } = string.Empty;
    public string TelefoneUsuario { get; set; } = string.Empty;
}
