using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TallerMecanico.Domain.Entities;

namespace TallerMecanico.Infrastructure.Persistence.Configurations;

public class VehiculoConfiguration : IEntityTypeConfiguration<Vehiculo>
{
    public void Configure(EntityTypeBuilder<Vehiculo> builder)
    {
        builder.ToTable("Vehiculos");
        builder.HasKey(v => v.Id);
        builder.Property(v => v.Marca).IsRequired().HasMaxLength(50);
        builder.Property(v => v.Modelo).IsRequired().HasMaxLength(50);
        builder.Property(v => v.Color).HasMaxLength(30);
        builder.Property(v => v.Placas).IsRequired().HasMaxLength(10);
        builder.Property(v => v.VIN).HasMaxLength(17);
        builder.HasIndex(v => v.Placas);
        builder.HasIndex(v => v.VIN).IsUnique();
        builder.HasMany(v => v.OrdenesTrabajo)
            .WithOne(o => o.Vehiculo)
            .HasForeignKey(o => o.VehiculoId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(v => v.Citas)
            .WithOne(c => c.Vehiculo)
            .HasForeignKey(c => c.VehiculoId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
