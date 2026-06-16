namespace TallerMecanico.Application.DTOs.Servicios;

public class ServicioDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal PrecioManoObra { get; set; }
    public bool Activo { get; set; }
}

public class CreateServicioDto
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal PrecioManoObra { get; set; }
}

public class UpdateServicioDto : CreateServicioDto
{
    public bool Activo { get; set; } = true;
}
