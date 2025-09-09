using AutoMapper;
using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Services.Interfaces;

namespace PetLink_BackEnd.Services.Entities
{
    public class GenericService<T, TDto> : IGenericService<T, TDto> where T : class where TDto : class
    {
        private readonly IGenericRepository<T> _repository;
        private readonly IMapper _mapper;

        public GenericService(IGenericRepository<T> repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TDto>> GetAll()
        {
            var entities = await _repository.Get();
            return _mapper.Map<IEnumerable<TDto>>(entities);
        }

        public async Task<TDto> GetById(int id)
        {
            var entity = await _repository.GetById(id);
            return _mapper.Map<TDto>(entity);
        }

        public async Task Create(TDto entityDTO)
        {
            var entity = _mapper.Map<T>(entityDTO);
            await _repository.Add(entity);
        }

        public async Task Update(TDto entityDTO, int id)
        {
            var existingEntity = await _repository.GetById(id); // Supondo que sua entidade tenha um campo Id

            if (existingEntity == null)
            {
                throw new KeyNotFoundException($"Entity with id {id} not found.");
            }

            var entity = _mapper.Map<T>(entityDTO);
            await _repository.Update(entity);
        }

        public async Task Remove(int id)
        {
            var entity = await _repository.GetById(id);
            if (entity == null)
            {
                throw new KeyNotFoundException($"Entidade com id: {id} não encontrado");
            }

            await _repository.Remove(entity);
        }
    }
}
