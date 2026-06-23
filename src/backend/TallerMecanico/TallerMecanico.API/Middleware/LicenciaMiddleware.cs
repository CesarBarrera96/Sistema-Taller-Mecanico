using System.Text.Json;
using TallerMecanico.Application.Interfaces;

namespace TallerMecanico.API.Middleware;

public class LicenciaMiddleware
{
    private readonly RequestDelegate _next;

    public LicenciaMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context, ILicenciaService licenciaService)
    {
        var method = context.Request.Method;
        var path = context.Request.Path.Value ?? "";

        var isWriteOperation = method == "POST" || method == "PUT" || method == "PATCH" || method == "DELETE";
        var isLicenciaEndpoint = path.StartsWith("/api/licencia", StringComparison.OrdinalIgnoreCase);
        var isAuthEndpoint = path.StartsWith("/api/auth", StringComparison.OrdinalIgnoreCase);
        var isConfigGet = path.StartsWith("/api/configuracion", StringComparison.OrdinalIgnoreCase) && method == "GET";

        if (isWriteOperation && !isLicenciaEndpoint && !isAuthEndpoint && !isConfigGet)
        {
            var activa = await licenciaService.ValidarEscrituraAsync();
            if (!activa)
            {
                context.Response.StatusCode = 403;
                context.Response.ContentType = "application/json";
                var response = new { mensaje = "Licencia vencida. No se permiten operaciones de escritura. Renueve su licencia en Configuracion.", codigo = "LICENCIA_VENCIDA" };
                await context.Response.WriteAsync(JsonSerializer.Serialize(response));
                return;
            }
        }

        if (method == "GET" && !isAuthEndpoint && !isLicenciaEndpoint)
        {
            await licenciaService.ActualizarUltimoAccesoAsync();
        }

        await _next(context);
    }
}
