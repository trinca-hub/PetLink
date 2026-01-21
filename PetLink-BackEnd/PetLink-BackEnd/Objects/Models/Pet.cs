using System.ComponentModel.DataAnnotations.Schema;
using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Objects.Models
{
    [Table("pet")]
    public class Pet
    {
        [Column("id")]
        public int Id { get; set; }

        [Column("nome")]
        public string Nome { get; set; }

        [Column("raca")]
        public string Raca { get; set; }

        [Column("sexo")]
        public string Sexo { get; set; }

        [Column("rga")]
        public string Rga { get; set; }

        [Column("idade")]
        public int Idade { get; set; }

        [Column("foto")]
        public string? Foto { get; set; }


        [Column("peso")]
        public float Peso { get; set; }

        [Column("castrado")]
        public bool Castrado { get; set; }

        [Column("tipopet")]
        public TipoPet TipoPet { get; set; }

        [Column("usuarioid")]
        public int UsuarioId { get; set; }
        public Usuario Usuario { get; set; } = null!;

        [Column("imagemurl")]
        public string ImagemUrl { get; set; }

        public Pet() { }

<<<<<<< HEAD
        public Pet(int id, string nome, string raca, string sexo, string rga, int idade, float peso, bool castrado, TipoPet tipoPet, int usuarioid, string? foto = null)
=======
        public Pet(int id, string nome, string raca, string sexo, string rga, int idade, float peso, bool castrado, TipoPet tipoPet, int usuarioid, string imagemUrl)
>>>>>>> b6aa95b71cc22555ce2741ae2f58d1ab25962415
        {
            Id = id;
            Nome = nome;
            Raca = raca;
            Sexo = sexo;
            Rga = rga;
            Idade = idade;
            Peso = peso;
            Castrado = castrado;
            TipoPet = tipoPet;
            UsuarioId = usuarioid;
<<<<<<< HEAD
            Foto = foto;
=======
            ImagemUrl = imagemUrl;
>>>>>>> b6aa95b71cc22555ce2741ae2f58d1ab25962415
        }
    }
}
