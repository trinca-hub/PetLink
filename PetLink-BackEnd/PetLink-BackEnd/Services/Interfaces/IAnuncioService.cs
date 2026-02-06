using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Services.Interfaces;

public interface IAnuncioService : IGenericService<Anuncio, AnuncioDTO>
{
    Task<int> CreateCompleto(CriarAnuncioDTO dto);

    Task<IEnumerable<PetinderFeedDTO>> GetFeedPetinder();
    Task<IEnumerable<PetfinderFeedDTO>> GetFeedPetfinder();
    Task<IEnumerable<PaypetFeedDTO>> GetFeedPaypet();

    Task UpdateDescricao(int anuncioId, string descricao);
    Task UpdatePetFinder(int anuncioId, EditarPetFinderDTO dto);
    Task UpdatePayPet(int anuncioId, EditarPayPetDTO dto);


}
