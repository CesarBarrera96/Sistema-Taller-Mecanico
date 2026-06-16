using TallerMecanico.Domain.Common;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Domain.Entities;

public class OrdenTrabajo : BaseEntity
{
    public string Folio { get; set; } = string.Empty;
    public int VehiculoId { get; set; }
    public int ClienteId { get; set; }
    public int EmpleadoRecibeId { get; set; }
    public int? EmpleadoAsignadoId { get; set; }
    public EstatusOrden Estatus { get; set; } = EstatusOrden.Recibida;
    public DateTime FechaEntrada { get; set; } = DateTime.Now;
    public DateTime? FechaPrometida { get; set; }
    public DateTime? FechaEntrega { get; set; }
    public int? KilometrajeEntrada { get; set; }
    public string? Diagnostico { get; set; }
    public string? Observaciones { get; set; }
    public decimal TotalManoObra { get; set; }
    public decimal TotalRefacciones { get; set; }
    public decimal Total { get; set; }

    public Vehiculo Vehiculo { get; set; } = null!;
    public Cliente Cliente { get; set; } = null!;
    public Empleado EmpleadoRecibe { get; set; } = null!;
    public Empleado? EmpleadoAsignado { get; set; }
    public ICollection<OrdenDetalle> Detalles { get; set; } = new List<OrdenDetalle>();
    public ICollection<InventarioMovimiento> MovimientosInventario { get; set; } = new List<InventarioMovimiento>();
    public ICollection<Cita> Citas { get; set; } = new List<Cita>();
    public Factura? Factura { get; set; }
}
