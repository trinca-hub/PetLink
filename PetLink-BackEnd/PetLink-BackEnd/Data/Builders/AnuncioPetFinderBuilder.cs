using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders;

public class AnuncioPetFinderBuilder
{
    public static void Build(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AnuncioPetFinder>().HasKey(x => x.AnuncioId);

        modelBuilder.Entity<AnuncioPetFinder>().Property(x => x.UltimoLocalVisto)
            .IsRequired()
            .HasMaxLength(200);

        modelBuilder.Entity<AnuncioPetFinder>().Property(x => x.DataDesaparecimento)
            .IsRequired();

        modelBuilder.Entity<AnuncioPetFinder>()
            .HasOne(x => x.Anuncio)
            .WithOne()
            .HasForeignKey<AnuncioPetFinder>(x => x.AnuncioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AnuncioPetFinder>().Property(x => x.PetId).IsRequired();

        modelBuilder.Entity<AnuncioPetFinder>()
            .HasOne(x => x.Pet)
            .WithMany()
            .HasForeignKey(x => x.PetId)
            .OnDelete(DeleteBehavior.Restrict);

    }
}
