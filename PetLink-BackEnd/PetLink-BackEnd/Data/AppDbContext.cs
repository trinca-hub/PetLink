using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Data.Builders;

namespace PetLink_BackEnd.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Produto> Produtos { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Administrador> Administradores { get; set; }
    public DbSet<Veterinario> Veterinarios { get; set; }
    public DbSet<Pedido> Pedidos { get; set; }
    public DbSet<ItemPedido> ItemPedidos { get; set; }
    public DbSet<Pet> Pet { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ProdutoBuilder.Build(modelBuilder);
        UsuarioBuilder.Build(modelBuilder);
        AdministradorBuilder.Build(modelBuilder);
        VeterinarioBuilder.Build(modelBuilder);
        PedidoBuilder.Build(modelBuilder);
        ItemPedidoBuilder.Build(modelBuilder);
        PetBuilder.Build(modelBuilder);
    }
}
