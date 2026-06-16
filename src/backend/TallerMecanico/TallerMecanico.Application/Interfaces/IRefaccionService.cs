using TallerMecanico.Application.DTOs.Refacciones;

namespace TallerMecanico.Application.Interfaces;

public interface IRefaccionService
{
    Task<IEnumerable<RefaccionDto>> GetAllAsync();
    Task<RefaccionDto?> GetByIdAsync(int id);
    Task<RefaccionDto> CreateAsync(CreateRefaccionDto dto);
    Task<RefaccionDto> UpdateAsync(int id, UpdateRefaccionDto dto);
    Task DeleteAsync(int id);
    Task<RefaccionDto> RegistrarMovimientoAsync(InventarioMovimientoDto dto);
    Task<IEnumerable<RefaccionDto>> GetStockBajoAsync();
}
