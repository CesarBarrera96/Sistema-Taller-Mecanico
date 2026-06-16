using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Application.DTOs.Citas;

public class CitaDto
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public int VehiculoId { get; set; }
    public string VehiculoDescripcion { get; set; } = string.Empty;
    public int? EmpleadoId { get; set; }
    public string? NombreEmpleado { get; set; }
    public DateTime FechaHora { get; set; }
    public int DuracionMinutos { get; set; }
    public EstatusCita Estatus { get; set; }
    public string Motivo { get; set; } = string.Empty;
    public string? Observaciones { get; set; }
    public int? OrdenTrabajoId { get; set; }
}

public class CreateCitaDto
{
    public int ClienteId { get; set; }
    public int VehiculoId { get; set; }
    public int? EmpleadoId { get; set; }
    public DateTime FechaHora { get; set; }
    public int DuracionMinutos { get; set; } = 60;
    public string Motivo { get; set; } = string.Empty;
    public string? Observaciones { get; set; }
}

public class UpdateCitaDto
{
    public int? EmpleadoId { get; set; }
    public DateTime? FechaHora { get; set; }
    public int? DuracionMinutos { get; set; }
    public EstatusCita? Estatus { get; set; }
    public string? Motivo { get; set; }
    public string? Observaciones { get; set; }
}
