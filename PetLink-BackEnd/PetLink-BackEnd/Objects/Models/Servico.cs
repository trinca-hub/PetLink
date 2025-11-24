using System.ComponentModel.DataAnnotations.Schema;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("servico")]
    public class Servico
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("dataServico")]
        public DateTime DataServico { get; set; }

        [Column("descricao")]
        public string Descricao { get; set; }

        [Column("tipo")]
        public int Tipo { get; set; }

        [Column("valor")]
        public float Valor { get; set; }

        public Servico() { }

        public Servico(int id, DateTime dataServico, string descricao, int tipo, float valor)
        {
            Id = id;
            DataServico = dataServico;
            Descricao = descricao;
            Tipo = tipo;
            Valor = valor;
        }
    }
}
