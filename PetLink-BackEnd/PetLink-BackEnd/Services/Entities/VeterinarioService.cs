using AutoMapper;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Contracts;
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

    public async Task<VeterinarioDTO> Login(Login login)
    {
        var veterinario = await _veterinarioRepository.Login(login);

        if (veterinario is not null) veterinario.Senha = "";
        return _mapper.Map<VeterinarioDTO>(veterinario);
    }

    public async Task<VeterinarioDTO> GetByEmail(string email)
    {
        var veterinario = await _veterinarioRepository.GetByEmail(email);

        if (veterinario == null)
            return null;

        return _mapper.Map<VeterinarioDTO>(veterinario);
    }
}