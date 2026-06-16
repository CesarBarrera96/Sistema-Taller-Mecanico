using TallerMecanico.Domain.Common;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Domain.Entities;

public class InventarioMovimiento : BaseEntity
{
    public int RefaccionId { get; set; }
    public TipoMovimiento TipoMovimiento { get; set; }
    public int Cantidad { get; set; }
    public decimal? PrecioUnitario { get; set; }
    public string? Motivo { get; set; }
    public int? OrdenTrabajoId { get; set; }
    public DateTime FechaMovimiento { get; set; } = DateTime.Now;

    public Refaccion Refaccion { get; set; } = null!;
    public OrdenTrabajo? OrdenTrabajo { get; set; }
}
