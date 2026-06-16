using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Application.DTOs.Ordenes;

public class OrdenTrabajoDto
{
    public int Id { get; set; }
    public string Folio { get; set; } = string.Empty;
    public int VehiculoId { get; set; }
    public string VehiculoDescripcion { get; set; } = string.Empty;
    public int ClienteId { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public int EmpleadoRecibeId { get; set; }
    public string NombreRecibe { get; set; } = string.Empty;
    public int? EmpleadoAsignadoId { get; set; }
    public string? NombreAsignado { get; set; }
    public EstatusOrden Estatus { get; set; }
    public DateTime FechaEntrada { get; set; }
    public DateTime? FechaPrometida { get; set; }
    public DateTime? FechaEntrega { get; set; }
    public int? KilometrajeEntrada { get; set; }
    public string? Diagnostico { get; set; }
    public string? Observaciones { get; set; }
    public decimal TotalManoObra { get; set; }
    public decimal TotalRefacciones { get; set; }
    public decimal Total { get; set; }
    public List<OrdenDetalleDto> Detalles { get; set; } = new();
}

public class CreateOrdenTrabajoDto
{
    public int VehiculoId { get; set; }
    public int ClienteId { get; set; }
    public int EmpleadoRecibeId { get; set; }
    public int? EmpleadoAsignadoId { get; set; }
    public DateTime? FechaPrometida { get; set; }
    public int? KilometrajeEntrada { get; set; }
    public string? Diagnostico { get; set; }
    public string? Observaciones { get; set; }
    public List<CreateOrdenDetalleDto> Detalles { get; set; } = new();
}

public class UpdateOrdenTrabajoDto
{
    public EstatusOrden? Estatus { get; set; }
    public int? EmpleadoAsignadoId { get; set; }
    public DateTime? FechaPrometida { get; set; }
    public DateTime? FechaEntrega { get; set; }
    public string? Diagnostico { get; set; }
    public string? Observaciones { get; set; }
    public decimal? Total { get; set; }
    public List<CreateOrdenDetalleDto>? Detalles { get; set; }
}

public class OrdenDetalleDto
{
    public int Id { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public int? ServicioId { get; set; }
    public string? NombreServicio { get; set; }
    public int? RefaccionId { get; set; }
    public string? NombreRefaccion { get; set; }
    public decimal Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal Subtotal { get; set; }
    public string? Notas { get; set; }
}

public class CreateOrdenDetalleDto
{
    public string Tipo { get; set; } = "Servicio";
    public int? ServicioId { get; set; }
    public int? RefaccionId { get; set; }
    public decimal Cantidad { get; set; } = 1;
    public string? Notas { get; set; }
}
