using TallerMecanico.Domain.Common;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Domain.Entities;

public class Usuario : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public RolUsuario Rol { get; set; } = RolUsuario.Recepcionista;
    public bool Activo { get; set; } = true;

    public Empleado? Empleado { get; set; }
}
