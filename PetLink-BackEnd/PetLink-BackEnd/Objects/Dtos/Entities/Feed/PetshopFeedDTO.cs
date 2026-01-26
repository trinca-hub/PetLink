namespace PetLink_BackEnd.Objects.Dtos.Entities;

public class PetshopFeedDTO
{
    public int AnuncioId { get; set; }
    public string Descricao { get; set; } = string.Empty;
    public DateTime DataCriacao { get; set; }

    public int ProdutoId { get; set; }
    public string NomeProduto { get; set; } = string.Empty;
    public float Preco { get; set; }
    public string? FotoProduto { get; set; }
}
