namespace PetLink_BackEnd.Objects.Dtos.Entities
{
    public class EnderecoUsuarioDTO
    {
        public int Id { get; set; }
        public int UsuarioId { get; set; }
        public string Apelido { get; set; } = string.Empty;
        public string Destinatario { get; set; } = string.Empty;
        public string Telefone { get; set; } = string.Empty;
        public string Cep { get; set; } = string.Empty;
        public string Uf { get; set; } = string.Empty;
        public string Cidade { get; set; } = string.Empty;
        public string Bairro { get; set; } = string.Empty;
        public string Rua { get; set; } = string.Empty;
        public int Numero { get; set; }
        public string Complemento { get; set; } = string.Empty;
        public string Referencia { get; set; } = string.Empty;
        public bool Principal { get; set; }
        public bool Ativo { get; set; } = true;
        public DateTime CriadoEm { get; set; }
    }
}
