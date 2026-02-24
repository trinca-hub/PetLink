namespace PetLink_BackEnd.Objects.Dtos.Entities
{
    public class ServicoDTO
    {
        public int Id { get; set; }
        public DateTime DataServico { get; set; }
        public string Descricao { get; set; }
        public int Tipo { get; set; }
        public float Valor { get; set; }
        public int PetId { get; set; }
    }
}
