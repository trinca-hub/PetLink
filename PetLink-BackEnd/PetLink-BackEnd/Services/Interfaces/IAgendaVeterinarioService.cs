using PetLink_BackEnd.Objects.Dtos.Entities.AgendaVeterinario;

namespace PetLink_BackEnd.Services.Interfaces
{
    public interface IAgendaVeterinarioService
    {
        Task<AgendaDTO> CriarAgenda(CriarAgendaDTO dto, int? veterinarioId);
        Task<AgendaDTO> AtualizarAgenda(int id, AtualizarAgendaDTO dto, int? veterinarioId);
        Task<AgendaDTO> BuscarAgendaVeterinario(int veterinarioId);
        Task<IEnumerable<SlotDisponivelDTO>> GerarSlotsDisponiveis(int veterinarioId, DateTime? dataInicio);
        Task<IEnumerable<SlotDisponivelDTO>> GerarSlotsDisponiveisTutor(int veterinarioId, DateTime? dataInicio);
        Task BloquearSlot(BloquearSlotDTO dto, int? veterinarioId);
        Task DesbloquearSlot(int veterinarioId, DateTime dataHoraInicio, int? veterinarioAutenticadoId);
    }
}
