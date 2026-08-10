using PetLink_BackEnd.Objects.Dtos.Entities.AgendamentoConsulta;

namespace PetLink_BackEnd.Services.Interfaces
{
    public interface IAgendamentoService
    {
        Task<AgendamentoConsultaDTO> CriarSolicitacao(CriarSolicitacaoConsultaDTO dto, int usuarioId);
        Task<AgendamentoConsultaDTO> CriarSolicitacaoVeterinario(CriarSolicitacaoVeterinarioDTO dto, int veterinarioId);
        Task<IEnumerable<AgendamentoConsultaDTO>> ListarSolicitacoesTutor(int usuarioId);
        Task<IEnumerable<AgendamentoConsultaDTO>> ListarSolicitacoesVeterinario(int veterinarioId);
        Task<AgendamentoConsultaDTO> BuscarPorId(int id);
        Task<AgendamentoConsultaDTO> ConfirmarConsulta(int id, ConfirmarConsultaDTO dto, int usuarioId, int? veterinarioId);
        Task<AgendamentoConsultaDTO> RecusarConsulta(int id, RecusarConsultaDTO dto, int usuarioId, int? veterinarioId);
        Task<AgendamentoConsultaDTO> RemarcarConsulta(int id, RemarcarConsultaDTO dto, int usuarioId, int? veterinarioId);
        Task<AgendamentoConsultaDTO> CancelarConsulta(int id, CancelarConsultaDTO dto, int usuarioId, int? veterinarioId);
    }
}
