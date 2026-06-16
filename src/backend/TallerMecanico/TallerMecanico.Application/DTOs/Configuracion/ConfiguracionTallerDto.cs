namespace TallerMecanico.Application.DTOs.Configuracion;

public class ConfiguracionTallerDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Rfc { get; set; }
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }
    public string? LeyendaPiePagina { get; set; }
    public string? LogoRuta { get; set; }
}

public class UpdateConfiguracionTallerDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Rfc { get; set; }
    public string? Telefono { get; set; }
    public string? Direccion { get; set; }
    public string? LeyendaPiePagina { get; set; }
}
