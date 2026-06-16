using Microsoft.EntityFrameworkCore;
using TallerMecanico.Domain.Entities;

namespace TallerMecanico.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<Usuario> Usuarios { get; }
    DbSet<Empleado> Empleados { get; }
    DbSet<Cliente> Clientes { get; }
    DbSet<Vehiculo> Vehiculos { get; }
    DbSet<Servicio> Servicios { get; }
    DbSet<Refaccion> Refacciones { get; }
    DbSet<OrdenTrabajo> OrdenesTrabajo { get; }
    DbSet<OrdenDetalle> OrdenDetalles { get; }
    DbSet<InventarioMovimiento> InventarioMovimientos { get; }
    DbSet<Cita> Citas { get; }
    DbSet<Factura> Facturas { get; }
    DbSet<FacturaDetalle> FacturaDetalles { get; }
    DbSet<ConfiguracionTaller> ConfiguracionTaller { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
