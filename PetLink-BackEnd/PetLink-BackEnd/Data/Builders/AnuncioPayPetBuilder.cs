using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders;

public class AnuncioPayPetBuilder
{
    public static void Build(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AnuncioPayPet>().HasKey(x => x.AnuncioId);

        modelBuilder.Entity<AnuncioPayPet>().Property(x => x.PetId).IsRequired();
        modelBuilder.Entity<AnuncioPayPet>().Property(x => x.TipoPayPet).IsRequired();
        modelBuilder.Entity<AnuncioPayPet>().Property(x => x.Valor);

        modelBuilder.Entity<AnuncioPayPet>()
            .HasOne(x => x.Anuncio)
            .WithOne()
            .HasForeignKey<AnuncioPayPet>(x => x.AnuncioId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<AnuncioPayPet>()
            .HasOne(x => x.Pet)
            .WithMany()
            .HasForeignKey(x => x.PetId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
