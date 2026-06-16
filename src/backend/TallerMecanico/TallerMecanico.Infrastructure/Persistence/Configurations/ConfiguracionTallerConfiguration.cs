using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TallerMecanico.Domain.Entities;

namespace TallerMecanico.Infrastructure.Persistence.Configurations;

public class ConfiguracionTallerConfiguration : IEntityTypeConfiguration<ConfiguracionTaller>
{
    public void Configure(EntityTypeBuilder<ConfiguracionTaller> builder)
    {
        builder.ToTable("ConfiguracionTaller");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Nombre).IsRequired().HasMaxLength(200);
        builder.Property(c => c.Rfc).HasMaxLength(20);
        builder.Property(c => c.Telefono).HasMaxLength(20);
        builder.Property(c => c.Direccion).HasMaxLength(500);
        builder.Property(c => c.LeyendaPiePagina).HasMaxLength(300);
        builder.Property(c => c.LogoRuta).HasMaxLength(500);
    }
}
