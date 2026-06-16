using TallerMecanico.Application.DTOs.Facturas;

namespace TallerMecanico.Application.Interfaces;

public interface IFacturaService
{
    Task<IEnumerable<FacturaDto>> GetAllAsync();
    Task<FacturaDto?> GetByIdAsync(int id);
    Task<FacturaDto> CreateFromOrdenAsync(CreateFacturaDto dto);
    Task<FacturaDto> PagarAsync(int id, PagarFacturaDto dto);
    Task<FacturaDto> CancelarAsync(int id);
    Task<FacturaDto> UpdateAsync(int id, UpdateFacturaDto dto);
    Task<FacturaPdfData> GetPdfDataAsync(int id);
}
