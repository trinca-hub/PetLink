using AutoMapper;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Objects.Dtos.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Produto, ProdutoDTO>().ReverseMap();
            CreateMap<Usuario, UsuarioDTO>().ReverseMap();
            CreateMap<Administrador, AdministradorDTO>().ReverseMap();
            CreateMap<Veterinario, VeterinarioDTO>().ReverseMap();
            CreateMap<Pedido, PedidoDTO>().ReverseMap();
            CreateMap<ItemPedido, ItemPedidoDTO>().ReverseMap();
<<<<<<< HEAD
            CreateMap<Pet, PetDTO>().ReverseMap();
=======
            CreateMap<Servico, ServicoDTO>().ReverseMap();
>>>>>>> 7abe2be1335e96785d2685e693d1252d28fe6abd
        }
    }
}
