namespace PetLink_BackEnd.Objects.Dtos.Entities
{
    public class PedidoDTO
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public DateTime DataPedido { get; set; }
    }
}
