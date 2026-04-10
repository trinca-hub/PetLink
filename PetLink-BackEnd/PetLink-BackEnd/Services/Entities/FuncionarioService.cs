using AutoMapper;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Contracts;
using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities
{
    public class FuncionarioService : GenericService<Funcionario, FuncionarioDTO>, IFuncionarioService
    {
        private readonly IFuncionarioRepository _funcionarioRepository;
        private readonly IMapper _mapper;

        public FuncionarioService(IFuncionarioRepository funcionarioRepository, IMapper mapper) : base(funcionarioRepository, mapper)
        {
            _funcionarioRepository = funcionarioRepository;
            _mapper = mapper;
        }

        public async Task<FuncionarioDTO> Login(Login login)
        {
            var funcionario = await _funcionarioRepository.Login(login);

            if (funcionario is not null) funcionario.Senha = "";
            return _mapper.Map<FuncionarioDTO>(funcionario);
        }

        public async Task<FuncionarioDTO> GetByEmail(string email)
        {
            var funcionario = await _funcionarioRepository.GetByEmail(email);

            if (funcionario == null)
                return null;

            return _mapper.Map<FuncionarioDTO>(funcionario);
        }
    }
}
