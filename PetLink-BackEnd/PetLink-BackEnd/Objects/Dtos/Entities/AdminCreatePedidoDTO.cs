namespace PetLink_BackEnd.Objects.Dtos.Entities
{
    public class AdminCreatePedidoDTO
    {
        public int? UsuarioId { get; set; }
        public bool EmNomeProprio { get; set; }
        public DateTime? DataPedido { get; set; }
    }
}
