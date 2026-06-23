namespace TallerMecanico.Application.DTOs.Licencia;

public class LicenciaStatusDto
{
    public bool Activa { get; set; }
    public string Estado { get; set; } = "Vencida";
    public DateTime? FechaExpiracion { get; set; }
    public int? DiasRestantes { get; set; }
    public int? MinutosRestantes { get; set; }
}

public class ActivarLicenciaDto
{
    public string Token { get; set; } = string.Empty;
}

public enum EstadoLicencia
{
    Activa,
    Vencida,
    RelojAtrasado
}
