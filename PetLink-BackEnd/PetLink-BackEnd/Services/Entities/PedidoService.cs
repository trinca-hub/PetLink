using AutoMapper;
using Microsoft.EntityFrameworkCore;
using PetLink_BackEnd.Data;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities;

public class PedidoService : GenericService<Pedido, PedidoDTO>, IPedidoService
{
    private readonly AppDbContext _context;
    private readonly IMapper _mapper;

    public PedidoService(
        IPedidoRepository pedidoRepo,
        IMapper mapper,
        AppDbContext context
    ) : base(pedidoRepo, mapper)
    {
        _context = context;
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
}
