using AutoMapper;
using PetLink_BackEnd.Data.Interfaces;
using PetLink_BackEnd.Objects.Contracts;
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

        public async Task<AdministradorDTO> Login(Login login)
        {
            var administrador = await _administradorRepository.Login(login);

            if (administrador is not null) administrador.Senha = "";
            return _mapper.Map<AdministradorDTO>(administrador);
        }

        public async Task<AdministradorDTO> GetByEmail(string email)
        {
            var administrador = await _administradorRepository.GetByEmail(email);

            if (administrador == null)
                return null;

            return _mapper.Map<AdministradorDTO>(administrador);
        }
    }
}
