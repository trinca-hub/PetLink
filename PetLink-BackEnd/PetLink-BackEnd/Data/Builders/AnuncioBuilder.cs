using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders;

public class AnuncioBuilder
{
    public static void Build(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Anuncio>().HasKey(a => a.Id);

        modelBuilder.Entity<Anuncio>().Property(a => a.Descricao)
            .IsRequired()
            .HasMaxLength(500);

        modelBuilder.Entity<Anuncio>().Property(a => a.TipoAnuncio).IsRequired();
        modelBuilder.Entity<Anuncio>().Property(a => a.DataCriacao).IsRequired();

        modelBuilder.Entity<Anuncio>().Property(a => a.CriadorTipo).IsRequired();
        modelBuilder.Entity<Anuncio>().Property(a => a.CriadorId).IsRequired();

        modelBuilder.Entity<Anuncio>().Property(a => a.OrigemEndereco).IsRequired();

        // UsuarioId pode ser null
        modelBuilder.Entity<Anuncio>()
            .HasOne(a => a.Usuario)
            .WithMany()
            .HasForeignKey(a => a.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
