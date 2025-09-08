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

            modelBuilder.Entity<Produto>()
                .HasData(new List<Produto>
                {
                    new Produto(1, "Ração 500g", 10.00f, "Ração Pedigree 500 gramas", 10),
                    new Produto(2, "Petisco de Bacon", 11.00f, "Petisco de Palito sabor bacon", 15)
                });

        }
    }
}
