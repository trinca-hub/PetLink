using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders
{
    public class FuncionarioBuilder
    {
        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Funcionario>().HasKey(u => u.Id);
            modelBuilder.Entity<Funcionario>().Property(u => u.Nome).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<Funcionario>().Property(u => u.Email).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<Funcionario>().Property(u => u.Senha).IsRequired().HasMaxLength(256);
            modelBuilder.Entity<Funcionario>().Property(u => u.Salario).IsRequired();
            modelBuilder.Entity<Funcionario>().HasIndex(u => u.Email).IsUnique();

            modelBuilder.Entity<Funcionario>()
                .HasData(new List<Funcionario>
                {
                    new Funcionario(1, "Funcionario 1", "funcionario1@petlink.com", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", 2500.00m),
                    new Funcionario(2, "Funcionario 2", "funcionario2@petlink.com", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", 3200.00m),
                    new Funcionario(3, "Funcionario 3", "funcionario3@petlink.com", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", 4100.00m),
                });
        }
    }
}
