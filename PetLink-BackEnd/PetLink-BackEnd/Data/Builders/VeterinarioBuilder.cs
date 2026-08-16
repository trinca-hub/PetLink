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
            modelBuilder.Entity<Veterinario>().Property(u => u.Senha).IsRequired().HasMaxLength(256);
            modelBuilder.Entity<Veterinario>().Property(u => u.Status).IsRequired();

            modelBuilder.Entity<Veterinario>()
                .HasData(new List<Veterinario>
                {
                    new Veterinario(1, "Gabriel", "4750", 100000, "gabriel@gmail.com", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", Status.DESATIVO),
                    new Veterinario(2, "Enzo", "7452", 100000, "enzo@gmail.com", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", Status.ATIVO),
                    new Veterinario(3, "Yasmin", "0001", 100000, "yasmin@gmail.com", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", Status.ATIVO),
                });

        }
    }
}
