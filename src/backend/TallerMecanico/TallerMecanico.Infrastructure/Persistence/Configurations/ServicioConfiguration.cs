using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TallerMecanico.Domain.Entities;

namespace TallerMecanico.Infrastructure.Persistence.Configurations;

public class ServicioConfiguration : IEntityTypeConfiguration<Servicio>
{
    public void Configure(EntityTypeBuilder<Servicio> builder)
    {
        builder.ToTable("Servicios");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Nombre).IsRequired().HasMaxLength(150);
        builder.Property(s => s.Descripcion).HasMaxLength(500);
        builder.Property(s => s.PrecioManoObra).HasColumnType("REAL").HasDefaultValue(0m);
        builder.Property(s => s.Activo).HasDefaultValue(true);
    }
}
