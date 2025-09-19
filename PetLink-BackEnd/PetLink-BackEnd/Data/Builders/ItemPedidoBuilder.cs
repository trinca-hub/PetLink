using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Builders
{
    public class ItemPedidoBuilder
    {
        public static void Build(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ItemPedido>().HasKey("Id");
            modelBuilder.Entity<ItemPedido>().Property(ip => ip.PedidoId).IsRequired();
            modelBuilder.Entity<ItemPedido>().Property(ip => ip.ProdutoId).IsRequired();
            modelBuilder.Entity<ItemPedido>().Property(ip => ip.Quantidade).IsRequired();

            modelBuilder.Entity<ItemPedido>()
                .HasData(new List<ItemPedido>
                {
                    new ItemPedido(1, 1, 1, 10),
                    new ItemPedido(2, 2, 2, 5)
                });

        }
    }
}
