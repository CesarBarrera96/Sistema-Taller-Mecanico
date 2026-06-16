using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TallerMecanico.Domain.Entities;

namespace TallerMecanico.Infrastructure.Persistence.Configurations;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("Usuarios");
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Username).IsRequired().HasMaxLength(50);
        builder.HasIndex(u => u.Username).IsUnique();
        builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(500);
        builder.Property(u => u.Rol).HasConversion<string>().HasMaxLength(20);
        builder.Property(u => u.Activo).HasDefaultValue(true);
        builder.HasOne(u => u.Empleado)
            .WithOne(e => e.Usuario)
            .HasForeignKey<Empleado>(e => e.UsuarioId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
