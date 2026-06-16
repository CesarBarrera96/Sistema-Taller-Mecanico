using TallerMecanico.Domain.Common;

namespace TallerMecanico.Domain.Entities;

public class Empleado : BaseEntity
{
    public string Nombre { get; set; } = string.Empty;
    public string ApellidoPaterno { get; set; } = string.Empty;
    public string? ApellidoMaterno { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string Puesto { get; set; } = string.Empty;
    public int? UsuarioId { get; set; }
    public bool Activo { get; set; } = true;

    public Usuario? Usuario { get; set; }
    public ICollection<OrdenTrabajo> OrdenesRecibidas { get; set; } = new List<OrdenTrabajo>();
    public ICollection<OrdenTrabajo> OrdenesAsignadas { get; set; } = new List<OrdenTrabajo>();
    public ICollection<Cita> Citas { get; set; } = new List<Cita>();
}
