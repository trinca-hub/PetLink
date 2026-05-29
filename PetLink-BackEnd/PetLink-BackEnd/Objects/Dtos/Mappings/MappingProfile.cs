using AutoMapper;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Dtos.Entities.AgendaVeterinario;
using PetLink_BackEnd.Objects.Dtos.Entities.AgendamentoConsulta;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Objects.Dtos.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Produto, ProdutoDTO>().ReverseMap();
            CreateMap<Usuario, UsuarioDTO>().ReverseMap();
            CreateMap<Funcionario, FuncionarioDTO>().ReverseMap();

            CreateMap<UsuarioDTO, Usuario>()
                .ForMember(dest => dest.Senha, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<FuncionarioDTO, Funcionario>()
                .ForMember(dest => dest.Senha, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<VeterinarioDTO, Veterinario>()
                .ForMember(dest => dest.Senha, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<AdministradorDTO, Administrador>()
                .ForMember(dest => dest.Senha, opt => opt.Ignore())
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<Administrador, AdministradorDTO>().ReverseMap();
            CreateMap<Veterinario, VeterinarioDTO>().ReverseMap();
            CreateMap<Pedido, PedidoDTO>().ReverseMap();
            CreateMap<ItemPedido, ItemPedidoDTO>().ReverseMap();
            CreateMap<Pet, PetDTO>().ReverseMap();
            CreateMap<Servico, ServicoDTO>().ReverseMap();
            CreateMap<Anuncio, AnuncioDTO>().ReverseMap();
            CreateMap<AnuncioPayPet, AnuncioPayPetDTO>().ReverseMap();
            CreateMap<AnuncioPetFinder, AnuncioPetFinderDTO>().ReverseMap();
            CreateMap<AnuncioPeTinder, AnuncioPeTinderDTO>().ReverseMap();
            CreateMap<AgendaVeterinario, AgendaDTO>().ReverseMap();
            CreateMap<AgendamentoConsulta, AgendamentoConsultaDTO>().ReverseMap();
        }
    }
}
