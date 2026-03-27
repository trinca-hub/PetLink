namespace PetLink_BackEnd.Objects.Dtos.Entities
{
    public class UsuarioDTO
    {
        public int Id { get; set; }

        public string Nome { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;
        public string Cep { get; set; } = string.Empty;
        public string Uf { get; set; } = string.Empty;
        public string Cidade { get; set; } = string.Empty;
        public string Bairro { get; set; } = string.Empty;
        public string Rua { get; set; } = string.Empty;

        public int Numero { get; set; }

        public string Email
        {
            get => _email;
            set => _email = (value ?? string.Empty).ToLower();
        }
        private string _email = string.Empty;

        public string Senha { get; set; } = string.Empty;
    }
}
