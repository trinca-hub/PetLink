using AutoMapper;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities;

public class UsuarioService : GenericService<Usuario, UsuarioDTO>, IUsuarioService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IMapper _mapper;

    public UsuarioService(IUsuarioRepository usuarioRepository, IMapper mapper) : base(usuarioRepository, mapper)
    {
        _usuarioRepository = usuarioRepository;
        _mapper = mapper;
    }

    public async Task<UsuarioDTO> Login(Login login)
    {
        var usuario = await _usuarioRepository.Login(login);
        var usuarioDTO = _mapper.Map<UsuarioDTO>(usuario);

        // A senha não deve aparecer na resposta, mas nunca pode ser alterada
        // na entidade carregada durante o processo de login.
        if (usuarioDTO is not null)
            usuarioDTO.Senha = "";

        return usuarioDTO;
    }

    public async Task<UsuarioDTO> GetByEmail(string email)
    {
        var usuario = await _usuarioRepository.GetByEmail(email);

        if (usuario == null)
            return null;

        return _mapper.Map<UsuarioDTO>(usuario);
    }

    public override async Task Create(UsuarioDTO usuarioDTO)
    {
        var usuario = new Usuario
        {
            Nome = usuarioDTO.Nome,
            Telefone = usuarioDTO.Telefone,
            Cep = usuarioDTO.Cep,
            Uf = usuarioDTO.Uf,
            Cidade = usuarioDTO.Cidade,
            Bairro = usuarioDTO.Bairro,
            Rua = usuarioDTO.Rua,
            Numero = usuarioDTO.Numero,
            Email = usuarioDTO.Email,
            Senha = usuarioDTO.Senha,
        };
        await _usuarioRepository.Add(usuario);
    }

}
