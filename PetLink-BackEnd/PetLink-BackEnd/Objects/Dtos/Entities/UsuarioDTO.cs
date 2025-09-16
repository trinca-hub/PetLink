namespace PetLink_BackEnd.Objects.Dtos.Entities
{
    public class UsuarioDTO
    {
        public int Id { get; set; }
        public string Nome { get; set; }
        public string Telefone { get; set; }
        public string Cep { get; set; }
        public string Uf { get; set; }
        public string Cidade { get; set; }
        public string Bairro { get; set; }
        public string Rua { get; set; }
        public int Numero { get; set; }
        public string Email
        {
            // Podemos definir processamentos ao pegar ou definir o valor de um campo
            // Isso é útil caso desejamos formatar ou validar os dados
            get => _email;
            set => _email = value.ToLower();
        }
        private string _email;
        public string Senha { get; set; }
    }
}
