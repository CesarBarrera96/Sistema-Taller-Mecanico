using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Application.Services;
using TallerMecanico.Domain.Interfaces;
using TallerMecanico.Infrastructure.Persistence;
using TallerMecanico.Infrastructure.Repositories;

namespace TallerMecanico.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, string connectionString)
    {
        services.AddDbContext<TallerMecanicoDbContext>(options =>
        options.UseSqlite(connectionString));
        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<TallerMecanicoDbContext>());

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        services.AddScoped<IClienteService, ClienteService>();
        services.AddScoped<IVehiculoService, VehiculoService>();
        services.AddScoped<IOrdenService, OrdenService>();
        services.AddScoped<IServicioService, ServicioService>();
        services.AddScoped<IRefaccionService, RefaccionService>();
        services.AddScoped<IEmpleadoService, EmpleadoService>();
        services.AddScoped<ICitaService, CitaService>();
        services.AddScoped<IFacturaService, FacturaService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IConfiguracionTallerService, ConfiguracionTallerService>();
        services.AddScoped<IFacturaPdfService, FacturaPdfService>();
        services.AddScoped<ILicenciaService, LicenciaService>();

        return services;
    }
}
