using System.ComponentModel.DataAnnotations;

namespace PetLink_BackEnd.Objects.Dtos.Entities
{
    public class FuncionarioDTO
    {
        public int Id { get; set; }

        [Required]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email
        {
            get => _email;
            set => _email = (value ?? string.Empty).ToLower();
        }
        private string _email = string.Empty;

        [Required]
        public string Senha { get; set; } = string.Empty;

        [Required]
        public decimal Salario { get; set; }
    }
}
