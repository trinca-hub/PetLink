using AutoMapper;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities;

    public class PetService : GenericService<Pet, PetDTO>, IPetService
    {
        private readonly IPetRepository _petRepository;
        private readonly IMapper _mapper;

        public PetService(IPetRepository petRepository, IMapper mapper) : base(petRepository, mapper)
        {
            _petRepository = petRepository;
            _mapper = mapper;
        }
    }

