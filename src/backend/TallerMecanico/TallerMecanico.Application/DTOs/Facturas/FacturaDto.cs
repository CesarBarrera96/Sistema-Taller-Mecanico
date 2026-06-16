using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Application.DTOs.Facturas;

public class FacturaDto
{
    public int Id { get; set; }
    public string Folio { get; set; } = string.Empty;
    public int OrdenTrabajoId { get; set; }
    public string OrdenFolio { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public DateTime FechaFacturacion { get; set; }
    public decimal Subtotal { get; set; }
    public decimal IVA { get; set; }
    public decimal Total { get; set; }
    public EstatusFactura Estatus { get; set; }
    public string? MetodoPago { get; set; }
    public DateTime? FechaPago { get; set; }
    public string? Observaciones { get; set; }
    public List<FacturaDetalleDto> Detalles { get; set; } = new();
}

public class CreateFacturaDto
{
    public int OrdenTrabajoId { get; set; }
    public string? MetodoPago { get; set; }
    public string? Observaciones { get; set; }
}

public class PagarFacturaDto
{
    public string MetodoPago { get; set; } = string.Empty;
}

public class UpdateFacturaDto
{
    public string? MetodoPago { get; set; }
    public string? Observaciones { get; set; }
    public List<UpdateFacturaDetalleDto>? Detalles { get; set; }
}

public class UpdateFacturaDetalleDto
{
    public int Id { get; set; }
    public string Concepto { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
}

public class FacturaDetalleDto
{
    public int Id { get; set; }
    public string Concepto { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
}
