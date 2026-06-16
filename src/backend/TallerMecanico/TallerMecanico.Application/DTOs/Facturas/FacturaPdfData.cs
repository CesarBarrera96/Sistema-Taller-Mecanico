using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Application.DTOs.Facturas;

public class FacturaPdfData
{
    public string Folio { get; set; } = string.Empty;
    public DateTime FechaFacturacion { get; set; }
    public EstatusFactura Estatus { get; set; }

    public string TallerNombre { get; set; } = string.Empty;
    public string? TallerRfc { get; set; }
    public string? TallerTelefono { get; set; }
    public string? TallerDireccion { get; set; }
    public string? TallerLogoRuta { get; set; }
    public string? TallerLeyenda { get; set; }

    public string ClienteNombre { get; set; } = string.Empty;
    public string? ClienteTelefono { get; set; }
    public string? ClienteEmail { get; set; }
    public string? ClienteRfc { get; set; }
    public string? ClienteDireccion { get; set; }

    public string VehiculoDescripcion { get; set; } = string.Empty;
    public string VehiculoPlacas { get; set; } = string.Empty;
    public string? VehiculoColor { get; set; }
    public int? VehiculoAnio { get; set; }
    public string? VehiculoVin { get; set; }

    public List<FacturaDetallePdf> Detalles { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal IVA { get; set; }
    public decimal Total { get; set; }
}

public class FacturaDetallePdf
{
    public string Concepto { get; set; } = string.Empty;
    public decimal Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
}
