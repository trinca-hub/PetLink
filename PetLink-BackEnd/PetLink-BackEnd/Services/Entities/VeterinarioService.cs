using AutoMapper;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities;

public class VeterinarioService : GenericService<Veterinario, VeterinarioDTO>, IVeterinarioService
{
    private readonly IVeterinarioRepository _veterinarioRepository;
    private readonly IMapper _mapper;

    public VeterinarioService(IVeterinarioRepository veterinarioRepository, IMapper mapper) : base(veterinarioRepository, mapper)
    {
        _veterinarioRepository = veterinarioRepository;
        _mapper = mapper;
    }
}