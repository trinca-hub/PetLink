using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities;

public class PedidoService : GenericService<Pedido, PedidoDTO>, IPedidoService
{
    private readonly AppDbContext _context;
    private readonly IPedidoRepository _pedidoRepo;
    private readonly IMapper _mapper;

    public PedidoService(
        IPedidoRepository pedidoRepo,
        IMapper mapper,
        AppDbContext context
    ) : base(pedidoRepo, mapper)
    {
        _context = context;
        _pedidoRepo = pedidoRepo;
        _mapper = mapper;
    }

    public async Task<int> CreateAndReturnId(PedidoDTO pedidoDTO)
    {
        if (pedidoDTO == null)
            throw new ArgumentException("Dados inválidos.");

        if (pedidoDTO.UsuarioId <= 0)
            throw new ArgumentException("UsuarioId inválido.");

        // opcional: valida se usuário existe
        var exists = await _context.Usuarios.AnyAsync(u => u.Id == pedidoDTO.UsuarioId);
        if (!exists)
            throw new ArgumentException("Usuário não encontrado.");

        if (pedidoDTO.EnderecoUsuarioId.HasValue)
        {
            var enderecoValido = await _context.EnderecosUsuarios.AnyAsync(e =>
                e.Id == pedidoDTO.EnderecoUsuarioId.Value &&
                e.UsuarioId == pedidoDTO.UsuarioId &&
                e.Ativo);

            if (!enderecoValido)
                throw new ArgumentException("Endereço de entrega não encontrado para este usuário.");
        }

        var entity = _mapper.Map<Pedido>(pedidoDTO);

        // garante que o banco gere o ID
        entity.Id = 0;

        // se quiser forçar UTC:
        if (entity.DataPedido == default)
            entity.DataPedido = DateTime.UtcNow;
        else
            entity.DataPedido = DateTime.SpecifyKind(entity.DataPedido, DateTimeKind.Utc);

        _context.Pedidos.Add(entity);
        await _context.SaveChangesAsync();

        return entity.Id;
    }

    public async Task<IEnumerable<PedidoDTO>> GetByUsuarioId(int usuarioId)
    {
        var pedidos = await _pedidoRepo.GetByUsuarioId(usuarioId);
        return _mapper.Map<IEnumerable<PedidoDTO>>(pedidos);
    }

    public async Task CancelAndRestock(int pedidoId)
    {
        var pedido = await _context.Pedidos.FindAsync(pedidoId);
        if (pedido is null)
            throw new ArgumentException("Pedido não encontrado.");

        await using var tx = await _context.Database.BeginTransactionAsync();

        var itens = await _context.ItemPedidos
            .Where(i => i.PedidoId == pedidoId)
            .ToListAsync();

        foreach (var item in itens)
        {
            var produto = await _context.Produtos.FindAsync(item.ProdutoId);
            if (produto is not null)
            {
                produto.Quantidade += item.Quantidade;
            }
        }

        if (itens.Count > 0)
        {
            _context.ItemPedidos.RemoveRange(itens);
        }

        _context.Pedidos.Remove(pedido);
        await _context.SaveChangesAsync();

        await tx.CommitAsync();
    }
}
