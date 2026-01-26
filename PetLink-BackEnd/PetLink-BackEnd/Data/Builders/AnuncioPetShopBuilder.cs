using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders;

public class AnuncioPetShopBuilder
{
    public static void Build(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AnuncioPetShop>().HasKey(x => x.AnuncioId);

        modelBuilder.Entity<AnuncioPetShop>().Property(x => x.ProdutoId).IsRequired();
        modelBuilder.Entity<AnuncioPetShop>().Property(x => x.PetShopId).IsRequired();

        modelBuilder.Entity<AnuncioPetShop>()
            .HasOne(x => x.Anuncio)
            .WithOne()
            .HasForeignKey<AnuncioPetShop>(x => x.AnuncioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AnuncioPetShop>()
            .HasOne(x => x.Produto)
            .WithMany()
            .HasForeignKey(x => x.ProdutoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
