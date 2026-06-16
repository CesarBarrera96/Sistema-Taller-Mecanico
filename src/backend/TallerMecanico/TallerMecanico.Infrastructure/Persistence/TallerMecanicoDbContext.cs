using Microsoft.EntityFrameworkCore;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Domain.Common;
using TallerMecanico.Domain.Entities;

namespace TallerMecanico.Infrastructure.Persistence;

public class TallerMecanicoDbContext : DbContext, IApplicationDbContext
{
    public TallerMecanicoDbContext(DbContextOptions<TallerMecanicoDbContext> options)
        : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Empleado> Empleados => Set<Empleado>();
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Vehiculo> Vehiculos => Set<Vehiculo>();
    public DbSet<Servicio> Servicios => Set<Servicio>();
    public DbSet<Refaccion> Refacciones => Set<Refaccion>();
    public DbSet<OrdenTrabajo> OrdenesTrabajo => Set<OrdenTrabajo>();
    public DbSet<OrdenDetalle> OrdenDetalles => Set<OrdenDetalle>();
    public DbSet<InventarioMovimiento> InventarioMovimientos => Set<InventarioMovimiento>();
    public DbSet<Cita> Citas => Set<Cita>();
    public DbSet<Factura> Facturas => Set<Factura>();
    public DbSet<FacturaDetalle> FacturaDetalles => Set<FacturaDetalle>();
    public DbSet<ConfiguracionTaller> ConfiguracionTaller => Set<ConfiguracionTaller>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(TallerMecanicoDbContext).Assembly);

        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .Property<DateTime>("FechaCreacion")
                    .HasDefaultValueSql("datetime('now')");
                modelBuilder.Entity(entityType.ClrType)
                    .Property<DateTime>("FechaActualizacion")
                    .HasDefaultValueSql("datetime('now')");
            }
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            entry.Property(e => e.FechaActualizacion).CurrentValue = DateTime.Now;
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
