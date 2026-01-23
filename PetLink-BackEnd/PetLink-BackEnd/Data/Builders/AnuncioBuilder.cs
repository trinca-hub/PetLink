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

        modelBuilder.Entity<Anuncio>().Property(a => a.TipoAnuncio)
            .IsRequired();

        modelBuilder.Entity<Anuncio>().Property(a => a.DataCriacao)
            .IsRequired();

        modelBuilder.Entity<Anuncio>().Property(a => a.UsuarioId)
            .IsRequired();

        // 1 Usuario -> N Anuncios
        modelBuilder.Entity<Anuncio>()
            .HasOne(a => a.Usuario)
            .WithMany() // se você tiver Usuario.Anuncios, troca para .WithMany(u => u.Anuncios)
            .HasForeignKey(a => a.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
