using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Infrastructure.Persistence.Configurations;

public class FacturaConfiguration : IEntityTypeConfiguration<Factura>
{
    public void Configure(EntityTypeBuilder<Factura> builder)
    {
        builder.ToTable("Facturas");
        builder.HasKey(f => f.Id);
        builder.Property(f => f.Folio).IsRequired().HasMaxLength(20);
        builder.HasIndex(f => f.Folio).IsUnique();
        builder.Property(f => f.Subtotal).HasColumnType("REAL").HasDefaultValue(0m);
        builder.Property(f => f.IVA).HasColumnType("REAL").HasDefaultValue(0m);
        builder.Property(f => f.Total).HasColumnType("REAL").HasDefaultValue(0m);
        builder.Property(f => f.Estatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(f => f.MetodoPago).HasMaxLength(30);
        builder.Property(f => f.Observaciones).HasMaxLength(500);
        builder.HasIndex(f => f.Estatus);
        builder.HasMany(f => f.Detalles)
            .WithOne(d => d.Factura)
            .HasForeignKey(d => d.FacturaId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
