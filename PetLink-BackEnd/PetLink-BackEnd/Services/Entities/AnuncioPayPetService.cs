using AutoMapper;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities;

public class AnuncioPayPetService : GenericService<AnuncioPayPet, AnuncioPayPetDTO>, IAnuncioPayPetService
{
    private readonly IAnuncioPayPetRepository _repo;
    private readonly IMapper _mapper;

    public AnuncioPayPetService(IAnuncioPayPetRepository repo, IMapper mapper) : base(repo, mapper)
    {
        _repo = repo;
        _mapper = mapper;
    }
}
