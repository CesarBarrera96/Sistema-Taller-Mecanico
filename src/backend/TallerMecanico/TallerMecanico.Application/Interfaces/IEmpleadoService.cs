using TallerMecanico.Application.DTOs.Empleados;

namespace TallerMecanico.Application.Interfaces;

public interface IEmpleadoService
{
    Task<IEnumerable<EmpleadoDto>> GetAllAsync();
    Task<EmpleadoDto?> GetByIdAsync(int id);
    Task<EmpleadoDto> CreateAsync(CreateEmpleadoDto dto);
    Task<EmpleadoDto> UpdateAsync(int id, UpdateEmpleadoDto dto);
    Task DeleteAsync(int id);
}
