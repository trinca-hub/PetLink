using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders
{
    public class UsuarioBuilder
    {
        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Usuario>().HasKey(u => u.Id);
            modelBuilder.Entity<Usuario>().Property(u => u.Nome).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<Usuario>().Property(u => u.Telefone).IsRequired().HasMaxLength(11);
            modelBuilder.Entity<Usuario>().Property(u => u.Cep).IsRequired().HasMaxLength(8);
            modelBuilder.Entity<Usuario>().Property(u => u.Uf).IsRequired();
            modelBuilder.Entity<Usuario>().Property(u => u.Cidade).IsRequired();
            modelBuilder.Entity<Usuario>().Property(u => u.Bairro).IsRequired();
            modelBuilder.Entity<Usuario>().Property(u => u.Rua).IsRequired();
            modelBuilder.Entity<Usuario>().Property(u => u.Numero).IsRequired();
            modelBuilder.Entity<Usuario>().Property(u => u.Email).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<Usuario>().Property(u => u.Senha).IsRequired().HasMaxLength(256);

            modelBuilder.Entity<Usuario>()
                .HasData(new List<Usuario>
                {
                    new Usuario(1, "Gabriel", "179999999", "15790000", "São Paulo", "Rubineia", "Clone", "Rua dos Guerreiros", 1, "gabriel@gmail.com", "pokemon12"),
                    new Usuario(2, "Enzo", "17997938925", "15761006", "São Paulo", "Urânia", "NSF", "Travessia dos nóia", 69, "enzo@gmail.com", "123456"),
                    new Usuario(3, "Yasmin", "17997921343", "15761396", "São Paulo", "Dolcinópolis", "Centro", "Aquela rua lá",777, "yasmin@gmail.com", "fatecjales"),
                });

        }
    }
}
