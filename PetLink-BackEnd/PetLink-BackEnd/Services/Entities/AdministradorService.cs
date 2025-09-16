using AutoMapper;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities
{
    public class AdministradorService : GenericService<Administrador, AdministradorDTO>, IAdministradorService
    {
        private readonly IAdministradorRepository _administradorRepository;
        private readonly IMapper _mapper;

        public AdministradorService(IAdministradorRepository administradorRepository, IMapper mapper) : base(administradorRepository, mapper)
        {
            _administradorRepository = administradorRepository;
            _mapper = mapper;
        }
    }
}
