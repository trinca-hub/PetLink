namespace PetLink_BackEnd.Objects.Dtos.Entities;

public class AnuncioPayPetDTO
{
    public int AnuncioId { get; set; }
    public int TipoPayPet { get; set; }
    public decimal? Valor { get; set; }
}
