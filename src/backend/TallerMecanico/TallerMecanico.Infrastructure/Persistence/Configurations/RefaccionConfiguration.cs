using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TallerMecanico.Domain.Entities;

namespace TallerMecanico.Infrastructure.Persistence.Configurations;

public class RefaccionConfiguration : IEntityTypeConfiguration<Refaccion>
{
    public void Configure(EntityTypeBuilder<Refaccion> builder)
    {
        builder.ToTable("Refacciones");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.Codigo).IsRequired().HasMaxLength(50);
        builder.HasIndex(r => r.Codigo).IsUnique();
        builder.Property(r => r.Nombre).IsRequired().HasMaxLength(200);
        builder.Property(r => r.Descripcion).HasMaxLength(500);
        builder.Property(r => r.PrecioCompra).HasColumnType("REAL").HasDefaultValue(0m);
        builder.Property(r => r.PrecioVenta).HasColumnType("REAL").HasDefaultValue(0m);
        builder.Property(r => r.StockActual).HasDefaultValue(0);
        builder.Property(r => r.StockMinimo).HasDefaultValue(5);
        builder.Property(r => r.Activo).HasDefaultValue(true);
        builder.HasMany(r => r.Movimientos)
            .WithOne(m => m.Refaccion)
            .HasForeignKey(m => m.RefaccionId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(r => r.OrdenDetalles)
            .WithOne(d => d.Refaccion)
            .HasForeignKey(d => d.RefaccionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
