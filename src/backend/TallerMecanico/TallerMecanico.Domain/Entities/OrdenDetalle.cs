using TallerMecanico.Domain.Common;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Domain.Entities;

public class OrdenDetalle : BaseEntity
{
    public int OrdenTrabajoId { get; set; }
    public TipoDetalleOrden Tipo { get; set; }
    public int? ServicioId { get; set; }
    public int? RefaccionId { get; set; }
    public decimal Cantidad { get; set; } = 1;
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
    public string? Notas { get; set; }

    public OrdenTrabajo OrdenTrabajo { get; set; } = null!;
    public Servicio? Servicio { get; set; }
    public Refaccion? Refaccion { get; set; }
}
