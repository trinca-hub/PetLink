namespace PetLink_BackEnd.Objects.Dtos.Entities
{
    public class ProdutoDTO
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public float Preco { get; set; }
        public string Descricao { get; set; }
        public int Quantidade { get; set; }
    }
}
