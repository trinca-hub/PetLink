using PetLink_BackEnd.Objects.Dtos.Entities;
using PetLink_BackEnd.Objects.Models;

namespace PetLink_BackEnd.Services.Interfaces
{
    public interface IPetService : IGenericService<Pet, PetDTO>
    {
    }
}
