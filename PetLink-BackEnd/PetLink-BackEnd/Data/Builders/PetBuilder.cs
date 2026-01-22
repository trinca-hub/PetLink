using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Objects.Enums;

namespace PetLink_BackEnd.Data.Builders
{
    public class PetBuilder
    {

        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Pet>().HasKey(p => p.Id);
            modelBuilder.Entity<Pet>().Property(p => p.Nome).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<Pet>().Property(p => p.Raca).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<Pet>().Property(p => p.Sexo).IsRequired().HasMaxLength(20);
            modelBuilder.Entity<Pet>().Property(p => p.Rga).IsRequired().HasMaxLength(7);
            modelBuilder.Entity<Pet>().Property(p => p.Idade).IsRequired();
            modelBuilder.Entity<Pet>().Property(p => p.Peso).IsRequired();
            modelBuilder.Entity<Pet>().Property(p => p.Castrado).IsRequired();
            modelBuilder.Entity<Pet>().Property(p => p.TipoPet).IsRequired();
            modelBuilder.Entity<Pet>().Property(p => p.UsuarioId).IsRequired();

            modelBuilder.Entity<Pet>().Property(p => p.Foto).HasColumnName("foto").HasMaxLength(1000).IsRequired(false);




            modelBuilder.Entity<Pet>()
                    .HasData(new List<Pet>
                    {
                    new Pet(1, "Peroba", "Pit Bull", "Masculino", "22992", 12, 35.3f, false, TipoPet.CACHORRO, 1, "https://www.prodograw.com/wp-content/uploads/2025/09/American-Pitbull-1-800x800.jpg"),
                    new Pet(2, "Felipina", "Yorkshire", "Fêmea", "22392", 5, 5.5f, true, TipoPet.GATO, 2, "https://images.tcdn.com.br/img/img_prod/1087789/noticia_619419434679a87734bc0e.png"),
                    new Pet(3, "Neguin", "Pastor Alemão", "Masculino", "22192", 24, 30.9f, false, TipoPet.CACHORRO, 3, "https://objectstorage.sa-vinhedo-1.oraclecloud.com/n/axuh3s32sabm/b/cobasi-institutional-cms-bucket/o/prod/Pastor%202.jpg"),


                    });
        }
    }
}

