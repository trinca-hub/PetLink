using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities;

public class ItemPedidoService : GenericService<ItemPedido, ItemPedidoDTO>, IItemPedidoService
{
    private readonly IItemPedidoRepository _itempedidoRepository;
    private readonly IMapper _mapper;
    private readonly AppDbContext _context;

    public ItemPedidoService(
        IItemPedidoRepository itempedidoRepository,
        IMapper mapper,
        AppDbContext context
    ) : base(itempedidoRepository, mapper)
    {
        _itempedidoRepository = itempedidoRepository;
        _mapper = mapper;
        _context = context;
    }

    public async Task<IEnumerable<ItemPedidoDTO>> GetByPedidoId(int pedidoId)
    {
        var itens = await _itempedidoRepository.GetByPedidoId(pedidoId);
        return _mapper.Map<IEnumerable<ItemPedidoDTO>>(itens);
    }

    public override async Task Create(ItemPedidoDTO itempedidoDTO)
    {
        if (itempedidoDTO == null)
            throw new ArgumentException("Dados inválidos.");

        if (itempedidoDTO.PedidoId <= 0 || itempedidoDTO.ProdutoId <= 0 || itempedidoDTO.Quantidade <= 0)
            throw new ArgumentException("PedidoId, ProdutoId e Quantidade devem ser válidos.");

        var pedidoExiste = await _context.Pedidos.AnyAsync(p => p.Id == itempedidoDTO.PedidoId);
        if (!pedidoExiste)
            throw new ArgumentException("Pedido não encontrado.");

        var produtoExiste = await _context.Produtos.AnyAsync(p => p.Id == itempedidoDTO.ProdutoId);
        if (!produtoExiste)
            throw new ArgumentException("Produto não encontrado.");

        await using var tx = await _context.Database.BeginTransactionAsync();

        var linhasAfetadas = await _context.Database.ExecuteSqlInterpolatedAsync(
            $@"UPDATE produto
               SET quantidade = quantidade - {itempedidoDTO.Quantidade}
               WHERE id = {itempedidoDTO.ProdutoId}
                 AND quantidade >= {itempedidoDTO.Quantidade}"
        );

        if (linhasAfetadas == 0)
            throw new ArgumentException("Estoque insuficiente para este produto.");

        var entity = _mapper.Map<ItemPedido>(itempedidoDTO);
        entity.Id = 0;

        _context.ItemPedidos.Add(entity);
        await _context.SaveChangesAsync();

        await tx.CommitAsync();
    }
}