using TallerMecanico.Domain.Common;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Domain.Entities;

public class Cita : BaseEntity
{
    public int ClienteId { get; set; }
    public int VehiculoId { get; set; }
    public int? EmpleadoId { get; set; }
    public DateTime FechaHora { get; set; }
    public int DuracionMinutos { get; set; } = 60;
    public EstatusCita Estatus { get; set; } = EstatusCita.Programada;
    public string Motivo { get; set; } = string.Empty;
    public string? Observaciones { get; set; }
    public int? OrdenTrabajoId { get; set; }

    public Cliente Cliente { get; set; } = null!;
    public Vehiculo Vehiculo { get; set; } = null!;
    public Empleado? Empleado { get; set; }
    public OrdenTrabajo? OrdenTrabajo { get; set; }
}
