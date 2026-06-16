using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TallerMecanico.Domain.Entities;

namespace TallerMecanico.Infrastructure.Persistence.Configurations;

public class EmpleadoConfiguration : IEntityTypeConfiguration<Empleado>
{
    public void Configure(EntityTypeBuilder<Empleado> builder)
    {
        builder.ToTable("Empleados");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.Nombre).IsRequired().HasMaxLength(100);
        builder.Property(e => e.ApellidoPaterno).IsRequired().HasMaxLength(100);
        builder.Property(e => e.ApellidoMaterno).HasMaxLength(100);
        builder.Property(e => e.Telefono).HasMaxLength(20);
        builder.Property(e => e.Email).HasMaxLength(150);
        builder.Property(e => e.Puesto).IsRequired().HasMaxLength(50);
        builder.HasMany(e => e.OrdenesRecibidas)
            .WithOne(o => o.EmpleadoRecibe)
            .HasForeignKey(o => o.EmpleadoRecibeId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(e => e.OrdenesAsignadas)
            .WithOne(o => o.EmpleadoAsignado)
            .HasForeignKey(o => o.EmpleadoAsignadoId)
            .OnDelete(DeleteBehavior.SetNull);
        builder.HasMany(e => e.Citas)
            .WithOne(c => c.Empleado)
            .HasForeignKey(c => c.EmpleadoId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
