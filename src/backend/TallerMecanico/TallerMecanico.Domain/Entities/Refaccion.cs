using TallerMecanico.Domain.Common;

namespace TallerMecanico.Domain.Entities;

public class Refaccion : BaseEntity
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal PrecioCompra { get; set; }
    public decimal PrecioVenta { get; set; }
    public int StockActual { get; set; }
    public int StockMinimo { get; set; } = 5;
    public bool Activo { get; set; } = true;

    public ICollection<OrdenDetalle> OrdenDetalles { get; set; } = new List<OrdenDetalle>();
    public ICollection<InventarioMovimiento> Movimientos { get; set; } = new List<InventarioMovimiento>();
}
