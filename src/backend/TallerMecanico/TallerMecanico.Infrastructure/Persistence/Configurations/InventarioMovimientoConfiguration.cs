using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Infrastructure.Persistence.Configurations;

public class InventarioMovimientoConfiguration : IEntityTypeConfiguration<InventarioMovimiento>
{
    public void Configure(EntityTypeBuilder<InventarioMovimiento> builder)
    {
        builder.ToTable("InventarioMovimientos");
        builder.HasKey(m => m.Id);
        builder.Property(m => m.TipoMovimiento).HasConversion<string>().HasMaxLength(10);
        builder.Property(m => m.PrecioUnitario).HasColumnType("REAL");
        builder.Property(m => m.Motivo).HasMaxLength(200);
        builder.HasIndex(m => m.RefaccionId);
        builder.HasIndex(m => m.FechaMovimiento);
    }
}
