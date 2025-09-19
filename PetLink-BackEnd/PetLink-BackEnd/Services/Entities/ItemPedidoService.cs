using AutoMapper;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities;

public class ItemPedidoService : GenericService<ItemPedido, ItemPedidoDTO>, IItemPedidoService
{
    private readonly IItemPedidoRepository _itempedidoRepository;
    private readonly IMapper _mapper;

    public ItemPedidoService(IItemPedidoRepository itempedidoRepository, IMapper mapper) : base(itempedidoRepository, mapper)
    {
        _itempedidoRepository = itempedidoRepository;
        _mapper = mapper;
    }
}