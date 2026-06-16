using TallerMecanico.Domain.Common;

namespace TallerMecanico.Domain.Entities;

public class ConfiguracionTaller : BaseEntity
{
    public string Nombre { get; set; } = string.Empty;
    public string? Rfc { get; set; }
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }
    public string? LeyendaPiePagina { get; set; }
    public string? LogoRuta { get; set; }
}
