namespace PetLink_BackEnd.Objects.Dtos.Entities;

public class CriarAnuncioDTO
{
    public string Descricao { get; set; } = string.Empty;
    public int TipoAnuncio { get; set; }

    // ✅ agora pode ser null (petshop)
    public int? UsuarioId { get; set; }

    // ✅ usado quando for Petshop (admin)
    public int? CriadorId { get; set; }

    public CriarAnuncioPayPetDTO? PayPet { get; set; }
    public CriarAnuncioPetFinderDTO? PetFinder { get; set; }
    public CriarAnuncioPeTinderDTO? PeTinder { get; set; }
}

public class CriarAnuncioPayPetDTO
{
    public int PetId { get; set; }
    public int TipoPayPet { get; set; }
    public decimal? Valor { get; set; }
}

public class CriarAnuncioPetFinderDTO
{
    public int PetId { get; set; }
    public string UltimoLocalVisto { get; set; } = string.Empty;
    public DateTime DataDesaparecimento { get; set; }
}

public class CriarAnuncioPeTinderDTO
{
    public int PetId { get; set; }
}
