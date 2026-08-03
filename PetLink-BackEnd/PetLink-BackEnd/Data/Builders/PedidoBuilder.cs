using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders
{
    public class PedidoBuilder
    {
        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Pedido>().HasKey(p => p.Id);
            modelBuilder.Entity<Pedido>().Property(p => p.UsuarioId).IsRequired();
            modelBuilder.Entity<Pedido>().Property(p => p.EnderecoUsuarioId).IsRequired(false);
            modelBuilder.Entity<Pedido>().Property(p => p.DataPedido).IsRequired();

            modelBuilder.Entity<Pedido>()
                .HasOne(p => p.EnderecoUsuario)
                .WithMany()
                .HasForeignKey(p => p.EnderecoUsuarioId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Pedido>()
                .HasData(new List<Pedido>
                {
                    new Pedido(1, 1, new DateTime(2025, 9, 18, 10, 20, 32, DateTimeKind.Utc)),
                    new Pedido(2, 2, new DateTime(2025, 9, 18, 10, 20, 32, DateTimeKind.Utc))
                });

        }
    }
}
