using TallerMecanico.Application.DTOs.Configuracion;

namespace TallerMecanico.Application.Interfaces;

public interface IConfiguracionTallerService
{
    Task<ConfiguracionTallerDto> GetAsync();
    Task<ConfiguracionTallerDto> UpdateAsync(UpdateConfiguracionTallerDto dto);
    Task<string> UploadLogoAsync(Stream fileStream, string fileName);
    Task DeleteLogoAsync();
}
