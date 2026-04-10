using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Enums;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders
{
    public class AdministradorBuilder
    {
        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Administrador>().HasKey(a => a.Id);
            modelBuilder.Entity<Administrador>().Property(a => a.Nome).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<Administrador>().Property(a => a.Email).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<Administrador>().Property(a => a.Senha).IsRequired().HasMaxLength(256);
            modelBuilder.Entity<Administrador>().Property(a => a.Status).IsRequired();

            modelBuilder.Entity<Administrador>()
                .HasData(new List<Administrador>
                {
                new (1, "Miguel Silva", "miguelsilva@gmail.com", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", Status.ATIVO),
                new (2, "Gabriel Oliveira", "gabrieloliveira@gmail.com", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" ,Status.ATIVO),
                new (3, "Marco Brito", "marcobrito@gmail.com", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", Status.DESATIVO)
                });
        }
    }
}
