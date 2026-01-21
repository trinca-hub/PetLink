using AutoMapper;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Entities;
using PetLink_BackEnd.Services.Interfaces;

public class PetService : GenericService<Pet, PetDTO>, IPetService
{
    private readonly IPetRepository _petRepository;
    private readonly IMapper _mapper;

    public PetService(IPetRepository petRepository, IMapper mapper)
        : base(petRepository, mapper)
    {
<<<<<<< HEAD
        private readonly IPetRepository _petRepository;
        private readonly IMapper _mapper;

    public async Task<IEnumerable<PetDTO>> GetByUsuarioId(int usuarioId)
    {
        var pets = await _petRepository.GetByUsuarioId(usuarioId);
        return _mapper.Map<IEnumerable<PetDTO>>(pets);
    }

    public PetService(IPetRepository petRepository, IMapper mapper) : base(petRepository, mapper)
        {
            _petRepository = petRepository;
            _mapper = mapper;
        }
=======
        _petRepository = petRepository;
        _mapper = mapper;
>>>>>>> b6aa95b71cc22555ce2741ae2f58d1ab25962415
    }

    public async Task<IEnumerable<PetDTO>> GetByUsuarioId(int usuarioId)
    {
        var pets = await _petRepository.GetByUsuarioId(usuarioId);

        return pets.Select(p => _mapper.Map<PetDTO>(p));
    }
}
