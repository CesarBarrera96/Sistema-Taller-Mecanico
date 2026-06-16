namespace TallerMecanico.Application.DTOs.Refacciones;

public class RefaccionDto
{
    public int Id { get; set; }
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal PrecioCompra { get; set; }
    public decimal PrecioVenta { get; set; }
    public int StockActual { get; set; }
    public int StockMinimo { get; set; }
    public bool Activo { get; set; }
}

public class CreateRefaccionDto
{
    public string Codigo { get; set; } = string.Empty;
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal PrecioCompra { get; set; }
    public decimal PrecioVenta { get; set; }
    public int StockActual { get; set; }
    public int StockMinimo { get; set; } = 5;
}

public class UpdateRefaccionDto : CreateRefaccionDto
{
    public bool Activo { get; set; } = true;
}

public class InventarioMovimientoDto
{
    public int RefaccionId { get; set; }
    public string TipoMovimiento { get; set; } = "Entrada";
    public int Cantidad { get; set; }
    public decimal? PrecioUnitario { get; set; }
    public string? Motivo { get; set; }
}
