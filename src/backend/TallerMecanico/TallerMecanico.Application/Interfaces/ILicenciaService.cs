using TallerMecanico.Application.DTOs.Licencia;

namespace TallerMecanico.Application.Interfaces;

public interface ILicenciaService
{
    Task<LicenciaStatusDto> GetStatusAsync();
    Task<LicenciaStatusDto> ActivarAsync(string token);
    Task<bool> ValidarEscrituraAsync();
    Task ActualizarUltimoAccesoAsync();
}
