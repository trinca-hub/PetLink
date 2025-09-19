using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Objects.Dtos.Entities
{
    public class PetDTO
    {
            public int Id { get; set; }
            public string Nome { get; set; }
            public string Raca { get; set; }
            public string Sexo { get; set; }
            public string Rga { get; set; }
            public int Idade { get; set; }
            public float Peso { get; set; }
            public bool Castrado { get; set; }
            public TipoPet TipoPet { get; set; }
            public int UsuarioId { get; set; }

        
    }
}
