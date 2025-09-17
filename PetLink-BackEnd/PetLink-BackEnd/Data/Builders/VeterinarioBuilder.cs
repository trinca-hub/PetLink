using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Enums;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders
{
    public class VeterinarioBuilder
    {
        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Veterinario>().HasKey(u => u.Id);
            modelBuilder.Entity<Veterinario>().Property(u => u.Nome).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<Veterinario>().Property(u => u.Crmv).IsRequired().HasMaxLength(50);
            modelBuilder.Entity<Veterinario>().Property(u => u.Salario).IsRequired();
            modelBuilder.Entity<Veterinario>().Property(u => u.Email).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<Veterinario>().Property(u => u.Status).IsRequired();

            modelBuilder.Entity<Veterinario>()
                .HasData(new List<Veterinario>
                {
                    new Veterinario(1, "Gabriel", "4750", 100000, "gabriel@gmail.com", Status.DESATIVO),
                    new Veterinario(2, "Enzo", "7452", 100000, "enzo@gmail.com", Status.ATIVO),
                    new Veterinario(3, "Yasmin", "0001", 100000, "yasmin@gmail.com", Status.ATIVO),
                });

        }
    }
}
