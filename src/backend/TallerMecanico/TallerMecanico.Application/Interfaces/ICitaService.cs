using TallerMecanico.Application.DTOs.Citas;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Application.Interfaces;

public interface ICitaService
{
    Task<IEnumerable<CitaDto>> GetAllAsync();
    Task<CitaDto?> GetByIdAsync(int id);
    Task<IEnumerable<CitaDto>> GetByFechaAsync(string fecha);
    Task<CitaDto> CreateAsync(CreateCitaDto dto);
    Task<CitaDto> UpdateAsync(int id, UpdateCitaDto dto);
    Task DeleteAsync(int id);
    Task<CitaDto> ConvertirAOrdenAsync(int citaId);
}
