using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Objects.Dtos.Entities;
public class VeterinarioDTO
{
    public int Id { get; set; }
    public string Nome { get; set; }
    public string Crmv { get; set; }
    public float Salario { get; set; }
    public string Email
    {
        get => _email;
        set => _email = value.ToLower();
    }
    private string _email;
    public Status Status { get; set; }
}