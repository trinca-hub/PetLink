namespace PetLink_BackEnd.Objects.Dtos.Entities
{
    public class AdminCreatePedidoDTO
    {
        public int? UsuarioId { get; set; }
        public bool EmNomeProprio { get; set; }
        public DateTime? DataPedido { get; set; }
        public List<AdminCreatePedidoItemDTO>? Itens { get; set; }
    }

    public class AdminCreatePedidoItemDTO
    {
        public int ProdutoId { get; set; }
        public int Quantidade { get; set; }
    }
}
