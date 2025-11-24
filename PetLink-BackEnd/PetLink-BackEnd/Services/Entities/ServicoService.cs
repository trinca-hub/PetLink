using AutoMapper;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities;

public class ServicoService : GenericService<Servico, ServicoDTO>, IServicoService
{
    private readonly IServicoRepository _servicoRepository;
    private readonly IMapper _mapper;

    public ServicoService(IServicoRepository servicoRepository, IMapper mapper) : base(servicoRepository, mapper)
    {
        _servicoRepository = servicoRepository;
        _mapper = mapper;
    }
}