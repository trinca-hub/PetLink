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


            modelBuilder.Entity<Pet>()
                    .HasData(new List<Pet>
                    {
                    new Pet(1, "Peroba", "Pit Bull", "Masculino", "22992", 12, 35.3f, false, TipoPet.CACHORRO, 1),
                    new Pet(2, "Felipina", "Siâmes", "Fêmea", "22992", 5, 5.5f, true, TipoPet.GATO, 2),
                    new Pet(3, "Neguin", "Pastor Alemão", "Masculino", "22992", 24, 30.9f, false, TipoPet.CACHORRO, 3),

                    });
        }
    }
}

