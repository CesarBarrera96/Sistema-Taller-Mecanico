using TallerMecanico.Domain.Common;

namespace TallerMecanico.Domain.Entities;

public class Vehiculo : BaseEntity
{
    public int ClienteId { get; set; }
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public int Anio { get; set; }
    public string? Color { get; set; }
    public string Placas { get; set; } = string.Empty;
    public string? VIN { get; set; }
    public int? Kilometraje { get; set; }

    public Cliente Cliente { get; set; } = null!;
    public ICollection<OrdenTrabajo> OrdenesTrabajo { get; set; } = new List<OrdenTrabajo>();
    public ICollection<Cita> Citas { get; set; } = new List<Cita>();
}
