namespace TallerMecanico.Application.DTOs.Empleados;

public class EmpleadoDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string ApellidoPaterno { get; set; } = string.Empty;
    public string? ApellidoMaterno { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string Puesto { get; set; } = string.Empty;
    public int? UsuarioId { get; set; }
    public bool Activo { get; set; }
}

public class CreateEmpleadoDto
{
    public string Nombre { get; set; } = string.Empty;
    public string ApellidoPaterno { get; set; } = string.Empty;
    public string? ApellidoMaterno { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string Puesto { get; set; } = string.Empty;
}

public class UpdateEmpleadoDto : CreateEmpleadoDto
{
    public bool? Activo { get; set; }
}
