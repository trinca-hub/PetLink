namespace PetLink_BackEnd.Objects.Dtos.Entities
{
    public class EditarPayPetDTO
    {
        public int TipoPayPet { get; set; } // 1=ADOCAO/DOACAO, 2=VENDA
        public decimal? Valor { get; set; } // null quando doação
    }
}
