using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Data.Builders;

namespace PetLink_BackEnd.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Produto> Produtos { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<EnderecoUsuario> EnderecosUsuarios { get; set; }
    public DbSet<Funcionario> Funcionarios { get; set; }
    public DbSet<Administrador> Administradores { get; set; }
    public DbSet<Veterinario> Veterinarios { get; set; }
    public DbSet<Pedido> Pedidos { get; set; }
    public DbSet<ItemPedido> ItemPedidos { get; set; }
    public DbSet<Pet> Pets { get; set; }
    public DbSet<Servico> Servicos { get; set; }
    public DbSet<Anuncio> Anuncios { get; set; }
    public DbSet<AnuncioPayPet> AnunciosPayPet { get; set; }
    public DbSet<AnuncioPetFinder> AnunciosPetFinder { get; set; }
    public DbSet<AnuncioPeTinder> AnunciosPeTinder { get; set; }
    public DbSet<AgendaVeterinario> AgendasVeterinarios { get; set; }
    public DbSet<AgendaSlotBloqueado> AgendaSlotsBloqueados { get; set; }
    public DbSet<AgendamentoConsulta> AgendamentosConsultas { get; set; }
    public DbSet<TokenRedefinicaoSenha> TokensRedefinicaoSenha { get; set; }
    public DbSet<TentativaLogin> TentativasLogin { get; set; }
    public DbSet<TokenRedefinicaoSenhaGestao> TokensRedefinicaoSenhaGestao { get; set; }




    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        ProdutoBuilder.Build(modelBuilder);
        UsuarioBuilder.Build(modelBuilder);
        EnderecoUsuarioBuilder.Build(modelBuilder);
        FuncionarioBuilder.Build(modelBuilder);
        AdministradorBuilder.Build(modelBuilder);
        VeterinarioBuilder.Build(modelBuilder);
        PedidoBuilder.Build(modelBuilder);
        ItemPedidoBuilder.Build(modelBuilder);
        PetBuilder.Build(modelBuilder);
        ServicoBuilder.Build(modelBuilder);
        AnuncioBuilder.Build(modelBuilder);
        AnuncioPayPetBuilder.Build(modelBuilder);
        AnuncioPetFinderBuilder.Build(modelBuilder);
        AnuncioPeTinderBuilder.Build(modelBuilder);
        AgendaVeterinarioBuilder.Build(modelBuilder);
        AgendaSlotBloqueadoBuilder.Build(modelBuilder);
        AgendamentoConsultaBuilder.Build(modelBuilder);
        TokenRedefinicaoSenhaBuilder.Build(modelBuilder);
        TentativaLoginBuilder.Build(modelBuilder);
        modelBuilder.Entity<TokenRedefinicaoSenhaGestao>(entity =>
        {
            entity.HasIndex(token => new { token.Perfil, token.Email, token.TokenHash }).IsUnique();
        });



    }
}
