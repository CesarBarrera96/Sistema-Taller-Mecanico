using TallerMecanico.Domain.Common;

namespace TallerMecanico.Domain.Entities;

public class FacturaDetalle : BaseEntity
{
    public int FacturaId { get; set; }
    public string Concepto { get; set; } = string.Empty;
    public decimal Cantidad { get; set; } = 1;
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }

    public Factura Factura { get; set; } = null!;
}
