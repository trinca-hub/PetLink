namespace PetLink_BackEnd.Objects.Dtos.Entities;

public class AnuncioPetFinderDTO
{
    public int AnuncioId { get; set; }
    public string UltimoLocalVisto { get; set; } = string.Empty;
    public DateTime DataDesaparecimento { get; set; }
}
