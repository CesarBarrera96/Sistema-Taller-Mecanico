using TallerMecanico.Application.DTOs.Vehiculos;

namespace TallerMecanico.Application.Interfaces;

public interface IVehiculoService
{
    Task<IEnumerable<VehiculoDto>> GetAllAsync();
    Task<VehiculoDto?> GetByIdAsync(int id);
    Task<IEnumerable<VehiculoDto>> GetByClienteIdAsync(int clienteId);
    Task<VehiculoDto> CreateAsync(CreateVehiculoDto dto);
    Task<VehiculoDto> UpdateAsync(int id, UpdateVehiculoDto dto);
    Task DeleteAsync(int id);
}
