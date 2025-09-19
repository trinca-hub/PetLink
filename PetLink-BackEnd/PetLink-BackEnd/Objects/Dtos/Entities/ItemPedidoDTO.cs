namespace PetLink_BackEnd.Objects.Dtos.Entities
{
    public class ItemPedidoDTO
    {
        public int Id { get; set; }
        public int PedidoId { get; set; }
        public int ProdutoId { get; set; }
        public int Quantidade { get; set; }
    }
}
