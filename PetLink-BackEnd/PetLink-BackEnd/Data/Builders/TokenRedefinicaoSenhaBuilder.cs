using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders;

public static class TokenRedefinicaoSenhaBuilder
{
    public static void Build(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TokenRedefinicaoSenha>().HasKey(token => token.Id);
        modelBuilder.Entity<TokenRedefinicaoSenha>().Property(token => token.TokenHash).IsRequired().HasMaxLength(64);
        modelBuilder.Entity<TokenRedefinicaoSenha>().Property(token => token.ExpiraEm).IsRequired();
        modelBuilder.Entity<TokenRedefinicaoSenha>()
            .HasIndex(token => token.TokenHash)
            .IsUnique();
        modelBuilder.Entity<TokenRedefinicaoSenha>()
            .HasOne(token => token.Usuario)
            .WithMany()
            .HasForeignKey(token => token.UsuarioId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
