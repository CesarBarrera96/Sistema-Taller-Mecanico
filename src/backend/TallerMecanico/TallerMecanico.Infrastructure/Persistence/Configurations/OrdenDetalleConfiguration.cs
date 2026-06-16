using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Infrastructure.Persistence.Configurations;

public class OrdenDetalleConfiguration : IEntityTypeConfiguration<OrdenDetalle>
{
    public void Configure(EntityTypeBuilder<OrdenDetalle> builder)
    {
        builder.ToTable("OrdenDetalles");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Tipo).HasConversion<string>().HasMaxLength(10);
        builder.Property(d => d.Cantidad).HasColumnType("REAL").HasDefaultValue(1m);
        builder.Property(d => d.PrecioUnitario).HasColumnType("REAL");
        builder.Property(d => d.Subtotal).HasColumnType("REAL");
        builder.Property(d => d.Notas).HasMaxLength(500);
        builder.HasOne(d => d.Servicio)
            .WithMany(s => s.OrdenDetalles)
            .HasForeignKey(d => d.ServicioId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(d => d.Refaccion)
            .WithMany(r => r.OrdenDetalles)
            .HasForeignKey(d => d.RefaccionId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(d => d.OrdenTrabajoId);
    }
}
