namespace PetLink_BackEnd.Objects.Dtos.Entities;

public class AnuncioDTO
{
    public int Id { get; set; }
    public string Descricao { get; set; } = string.Empty;

    // enum vira int no DTO (igual o curso fez com EstadoMatricula)
    public int TipoAnuncio { get; set; }

    public int UsuarioId { get; set; }
}
