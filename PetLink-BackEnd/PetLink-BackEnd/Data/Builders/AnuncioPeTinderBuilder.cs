using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders;

public class AnuncioPeTinderBuilder
{
    public static void Build(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AnuncioPeTinder>().HasKey(x => x.AnuncioId);

        modelBuilder.Entity<AnuncioPeTinder>().Property(x => x.PetId)
            .IsRequired();

        modelBuilder.Entity<AnuncioPeTinder>()
            .HasOne(x => x.Anuncio)
            .WithOne()
            .HasForeignKey<AnuncioPeTinder>(x => x.AnuncioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AnuncioPeTinder>()
            .HasOne(x => x.Pet)
            .WithMany()
            .HasForeignKey(x => x.PetId)
            .OnDelete(DeleteBehavior.Restrict);

    }
}
