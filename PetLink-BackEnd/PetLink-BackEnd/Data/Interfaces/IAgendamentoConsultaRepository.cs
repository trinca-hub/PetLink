using PetLink_BackEnd.Data.Interafces;
using PetLink_BackEnd.Objects.Enums;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Data.Interfaces
{
    public interface IAgendamentoConsultaRepository : IGenericRepository<AgendamentoConsulta>
    {
        Task<IEnumerable<AgendamentoConsulta>> GetByUsuarioId(int usuarioId);
        Task<IEnumerable<AgendamentoConsulta>> GetByVeterinarioId(int veterinarioId);
        Task<IEnumerable<AgendamentoConsulta>> GetConfirmadosPorVeterinario(int veterinarioId, DateTime inicio, DateTime fim);
        Task<bool> ExistsConfirmadoConflito(int veterinarioId, DateTime inicio, DateTime fim, int? ignorarId);
        Task<bool> ExistsPendenteDuplicado(int veterinarioId, int petId, int usuarioId);
        Task<AgendamentoConsulta?> GetWithRelations(int id);
        Task<AgendamentoConsulta?> GetByIdForUpdate(int id);
    }
}
