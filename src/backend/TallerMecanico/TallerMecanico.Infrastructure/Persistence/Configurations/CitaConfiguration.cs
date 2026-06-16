using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.Infrastructure.Persistence.Configurations;

public class CitaConfiguration : IEntityTypeConfiguration<Cita>
{
    public void Configure(EntityTypeBuilder<Cita> builder)
    {
        builder.ToTable("Citas");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Estatus).HasConversion<string>().HasMaxLength(20);
        builder.Property(c => c.Motivo).IsRequired().HasMaxLength(500);
        builder.Property(c => c.Observaciones).HasMaxLength(500);
        builder.HasIndex(c => c.FechaHora);
        builder.HasIndex(c => c.Estatus);
    }
}
