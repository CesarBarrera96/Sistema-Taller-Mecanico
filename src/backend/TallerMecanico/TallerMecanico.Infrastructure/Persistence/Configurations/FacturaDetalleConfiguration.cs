using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TallerMecanico.Domain.Entities;

namespace TallerMecanico.Infrastructure.Persistence.Configurations;

public class FacturaDetalleConfiguration : IEntityTypeConfiguration<FacturaDetalle>
{
    public void Configure(EntityTypeBuilder<FacturaDetalle> builder)
    {
        builder.ToTable("FacturaDetalles");
        builder.HasKey(d => d.Id);
        builder.Property(d => d.Concepto).IsRequired().HasMaxLength(300);
        builder.Property(d => d.Cantidad).HasColumnType("REAL").HasDefaultValue(1m);
        builder.Property(d => d.PrecioUnitario).HasColumnType("REAL");
        builder.Property(d => d.Subtotal).HasColumnType("REAL");
    }
}
