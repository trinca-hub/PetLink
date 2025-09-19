using AutoMapper;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities;

public class PedidoService : GenericService<Pedido, PedidoDTO>, IPedidoService
{
    private readonly IPedidoRepository _pedidoRepository;
    private readonly IMapper _mapper;

    public PedidoService(IPedidoRepository pedidoRepository, IMapper mapper) : base(pedidoRepository, mapper)
    {
        _pedidoRepository = pedidoRepository;
        _mapper = mapper;
    }
}