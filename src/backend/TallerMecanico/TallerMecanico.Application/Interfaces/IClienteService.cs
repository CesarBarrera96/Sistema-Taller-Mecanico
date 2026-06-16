using TallerMecanico.Application.DTOs.Clientes;

namespace TallerMecanico.Application.Interfaces;

public interface IClienteService
{
    Task<IEnumerable<ClienteDto>> GetAllAsync();
    Task<ClienteDto?> GetByIdAsync(int id);
    Task<ClienteDto> CreateAsync(CreateClienteDto dto);
    Task<ClienteDto> UpdateAsync(int id, UpdateClienteDto dto);
    Task<ClienteDto> ToggleActivoAsync(int id);
    Task DeleteAsync(int id);
}
