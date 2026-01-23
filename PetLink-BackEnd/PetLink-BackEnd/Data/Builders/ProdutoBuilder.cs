using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders
{
    public class ProdutoBuilder
    {
        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Produto>().HasKey(p => p.Id);
            modelBuilder.Entity<Produto>().Property(p => p.Nome).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<Produto>().Property(p => p.Preco).IsRequired();
            modelBuilder.Entity<Produto>().Property(p => p.Descricao).IsRequired().HasMaxLength(256);
            modelBuilder.Entity<Produto>().Property(p => p.Quantidade).IsRequired();
            modelBuilder.Entity<Pet>().Property(p => p.Foto).HasColumnName("foto").HasMaxLength(1000).IsRequired(false);

            modelBuilder.Entity<Produto>()
                .HasData(new List<Produto>
                {
                    new Produto(1, "Ração 500g", 10.00f, "Ração Pedigree 500 gramas", 10, "https://imgs.search.brave.com/r1PNHaYGnd3HRBoNFQeFO3bRfx1uCwlGuwVT1mok0qo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9odHRw/Mi5tbHN0YXRpYy5j/b20vRF9RX05QXzJY/XzYzNjExOC1NTEE5/OTM1MDQ0MDgzOF8x/MTIwMjUtRS53ZWJw"),
                    new Produto(2, "Petisco de Bacon", 11.00f, "Petisco de Palito sabor bacon", 15, "https://imgs.search.brave.com/FKsGy9GxYXivL93X8J04VdbB87o_OqbnYrQk472t9P8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NDFvU0xsLU5jZkwu/anBn")
                });

        }
    }
}
