using TallerMecanico.Application.DTOs.Servicios;

namespace TallerMecanico.Application.Interfaces;

public interface IServicioService
{
    Task<IEnumerable<ServicioDto>> GetAllAsync();
    Task<ServicioDto?> GetByIdAsync(int id);
    Task<ServicioDto> CreateAsync(CreateServicioDto dto);
    Task<ServicioDto> UpdateAsync(int id, UpdateServicioDto dto);
    Task DeleteAsync(int id);
}
