using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TallerMecanico.Domain.Entities;

namespace TallerMecanico.Infrastructure.Persistence.Configurations;

public class ClienteConfiguration : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> builder)
    {
        builder.ToTable("Clientes");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Nombre).IsRequired().HasMaxLength(100);
        builder.Property(c => c.ApellidoPaterno).IsRequired().HasMaxLength(100);
        builder.Property(c => c.ApellidoMaterno).HasMaxLength(100);
        builder.Property(c => c.Telefono).IsRequired().HasMaxLength(20);
        builder.Property(c => c.Email).HasMaxLength(150);
        builder.Property(c => c.Direccion).HasMaxLength(300);
        builder.Property(c => c.RFC).HasMaxLength(13);
        builder.Property(c => c.Activo).HasDefaultValue(true);
        builder.HasIndex(c => c.Telefono);
        builder.HasMany(c => c.Vehiculos)
            .WithOne(v => v.Cliente)
            .HasForeignKey(v => v.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(c => c.OrdenesTrabajo)
            .WithOne(o => o.Cliente)
            .HasForeignKey(o => o.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(c => c.Citas)
            .WithOne(ci => ci.Cliente)
            .HasForeignKey(ci => ci.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);
        builder.HasMany(c => c.Facturas)
            .WithOne(f => f.Cliente)
            .HasForeignKey(f => f.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
