namespace PetLink_BackEnd.Objects.Dtos.Entities;

public class CriarAnuncioDTO
{
    // Base (sempre vem)
    public string Descricao { get; set; } = string.Empty;
    public int TipoAnuncio { get; set; }
    public int UsuarioId { get; set; }

    // Subtipos (só 1 deles deve vir, dependendo do TipoAnuncio)
    public CriarAnuncioPayPetDTO? PayPet { get; set; }
    public CriarAnuncioPetFinderDTO? PetFinder { get; set; }
    public CriarAnuncioPeTinderDTO? PeTinder { get; set; }
    public CriarAnuncioPetShopDTO? PetShop { get; set; }
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

public class CriarAnuncioPetShopDTO
{
    public int ProdutoId { get; set; }
    public int PetShopId { get; set; }
}
