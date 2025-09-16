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
                new (1, "Miguel Silva", "miguelsilva@gmail.com", "123456", Status.ATIVO),
                new (2, "Gabriel Oliveira", "gabrieloliveira@gmail.com", "abcdefg" ,Status.ATIVO),
                new (3, "Marco Brito", "marcobrito@gmail.com", "aaaaaaa", Status.DESATIVO)
                });
        }
    }
}
