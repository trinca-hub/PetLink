using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders
{
    public class EnderecoUsuarioBuilder
    {
        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<EnderecoUsuario>().HasKey(e => e.Id);
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.UsuarioId).IsRequired();
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.Apelido).IsRequired().HasMaxLength(60);
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.Destinatario).IsRequired().HasMaxLength(100);
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.Telefone).IsRequired().HasMaxLength(15);
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.Cep).IsRequired().HasMaxLength(8);
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.Uf).IsRequired().HasMaxLength(2);
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.Cidade).IsRequired().HasMaxLength(80);
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.Bairro).IsRequired().HasMaxLength(80);
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.Rua).IsRequired().HasMaxLength(120);
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.Numero).IsRequired();
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.Complemento).HasMaxLength(80);
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.Referencia).HasMaxLength(140);
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.Principal).IsRequired();
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.Ativo).IsRequired();
            modelBuilder.Entity<EnderecoUsuario>().Property(e => e.CriadoEm).IsRequired();

            modelBuilder.Entity<EnderecoUsuario>()
                .HasOne(e => e.Usuario)
                .WithMany()
                .HasForeignKey(e => e.UsuarioId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<EnderecoUsuario>()
                .HasIndex(e => new { e.UsuarioId, e.Principal });
        }
    }
}
