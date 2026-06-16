using TallerMecanico.Domain.Common;

namespace TallerMecanico.Domain.Entities;

public class Servicio : BaseEntity
{
    public string Nombre { get; set; } = string.Empty;
    public string? Descripcion { get; set; }
    public decimal PrecioManoObra { get; set; }
    public bool Activo { get; set; } = true;

    public ICollection<OrdenDetalle> OrdenDetalles { get; set; } = new List<OrdenDetalle>();
}
