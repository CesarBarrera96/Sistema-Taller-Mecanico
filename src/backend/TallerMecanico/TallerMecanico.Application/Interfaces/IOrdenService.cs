using TallerMecanico.Application.DTOs.Ordenes;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Application.Interfaces;

public interface IOrdenService
{
    Task<IEnumerable<OrdenTrabajoDto>> GetAllAsync();
    Task<OrdenTrabajoDto?> GetByIdAsync(int id);
    Task<IEnumerable<OrdenTrabajoDto>> GetByEstatusAsync(EstatusOrden estatus);
    Task<OrdenTrabajoDto> CreateAsync(CreateOrdenTrabajoDto dto);
    Task<OrdenTrabajoDto> UpdateAsync(int id, UpdateOrdenTrabajoDto dto);
    Task DeleteAsync(int id);
}
