using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Infrastructure.Persistence.Configurations;

public class OrdenTrabajoConfiguration : IEntityTypeConfiguration<OrdenTrabajo>
{
    public void Configure(EntityTypeBuilder<OrdenTrabajo> builder)
    {
        builder.ToTable("OrdenesTrabajo");
        builder.HasKey(o => o.Id);
        builder.Property(o => o.Folio).IsRequired().HasMaxLength(20);
        builder.HasIndex(o => o.Folio).IsUnique();
        builder.Property(o => o.Estatus).HasConversion<string>().HasMaxLength(20);
        builder.HasIndex(o => o.Estatus);
        builder.HasIndex(o => o.FechaEntrada);
        builder.Property(o => o.Diagnostico).HasMaxLength(1000);
        builder.Property(o => o.Observaciones).HasMaxLength(1000);
        builder.Property(o => o.TotalManoObra).HasColumnType("REAL").HasDefaultValue(0m);
        builder.Property(o => o.TotalRefacciones).HasColumnType("REAL").HasDefaultValue(0m);
        builder.Property(o => o.Total).HasColumnType("REAL").HasDefaultValue(0m);
        builder.HasMany(o => o.Detalles)
            .WithOne(d => d.OrdenTrabajo)
            .HasForeignKey(d => d.OrdenTrabajoId)
            .OnDelete(DeleteBehavior.Cascade);
        builder.HasMany(o => o.MovimientosInventario)
            .WithOne(m => m.OrdenTrabajo)
            .HasForeignKey(m => m.OrdenTrabajoId)
            .OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(o => o.Factura)
            .WithOne(f => f.OrdenTrabajo)
            .HasForeignKey<Factura>(f => f.OrdenTrabajoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
