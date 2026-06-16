using TallerMecanico.Domain.Common;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Domain.Entities;

public class Factura : BaseEntity
{
    public string Folio { get; set; } = string.Empty;
    public int OrdenTrabajoId { get; set; }
    public int ClienteId { get; set; }
    public DateTime FechaFacturacion { get; set; } = DateTime.Now;
    public decimal Subtotal { get; set; }
    public decimal IVA { get; set; }
    public decimal Total { get; set; }
    public EstatusFactura Estatus { get; set; } = EstatusFactura.Pendiente;
    public string? MetodoPago { get; set; }
    public DateTime? FechaPago { get; set; }
    public string? Observaciones { get; set; }

    public OrdenTrabajo OrdenTrabajo { get; set; } = null!;
    public Cliente Cliente { get; set; } = null!;
    public ICollection<FacturaDetalle> Detalles { get; set; } = new List<FacturaDetalle>();
}
