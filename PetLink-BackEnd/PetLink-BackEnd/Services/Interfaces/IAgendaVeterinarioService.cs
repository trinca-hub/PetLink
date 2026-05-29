using PetLink_BackEnd.Objects.Dtos.Entities.AgendaVeterinario;

namespace PetLink_BackEnd.Services.Interfaces
{
    public interface IAgendaVeterinarioService
    {
        Task<AgendaDTO> CriarAgenda(CriarAgendaDTO dto, int? veterinarioId);
        Task<AgendaDTO> AtualizarAgenda(int id, AtualizarAgendaDTO dto, int? veterinarioId);
        Task<AgendaDTO> BuscarAgendaVeterinario(int veterinarioId);
        Task<IEnumerable<DateTime>> GerarSlotsDisponiveis(int veterinarioId, DateTime? dataInicio);
        Task<IEnumerable<DateTime>> GerarSlotsDisponiveisTutor(int veterinarioId, DateTime? dataInicio);
    }
}
