using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using TallerMecanico.Application.DTOs.Licencia;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Interfaces;

namespace TallerMecanico.Application.Services;

public class LicenciaService : ILicenciaService
{
    private readonly IRepository<ConfiguracionTaller> _repository;
    private readonly string _secretPhrase;

    public LicenciaService(IRepository<ConfiguracionTaller> repository, IConfiguration configuration)
    {
        _repository = repository;
        _secretPhrase = configuration["Licencia:SecretPhrase"] ?? "TallerMecanico2026LicenciaAESKey!";
    }

    public async Task<LicenciaStatusDto> GetStatusAsync()
    {
        var all = await _repository.GetAllAsync();
        var config = all.FirstOrDefault();

        var now = DateTime.Now;
        await ActualizarUltimoAcceso(config, now);

        var estado = EvaluarEstadoLicencia(config, now);

        return new LicenciaStatusDto
        {
            Activa = estado == EstadoLicencia.Activa,
            Estado = estado.ToString(),
            FechaExpiracion = config?.FechaExpiracionLicencia,
            DiasRestantes = CalcularDiasRestantes(config, now),
            MinutosRestantes = CalcularMinutosRestantes(config, now)
        };
    }

    public async Task<LicenciaStatusDto> ActivarAsync(string token)
    {
        var datos = DesencriptarToken(token);
        if (datos == null)
            throw new InvalidOperationException("Token de licencia invalido. Verifique la clave e intente de nuevo.");

        if (datos.Expiracion < DateTime.Now)
            throw new InvalidOperationException("El token de licencia ha expirado. Solicite una nueva clave.");

        var all = await _repository.GetAllAsync();
        var config = all.FirstOrDefault();

        if (config == null)
        {
            config = new ConfiguracionTaller
            {
                Nombre = "Taller Mecanico",
                ClaveLicencia = token,
                FechaExpiracionLicencia = datos.Expiracion,
                UltimoAccesoRegistrado = DateTime.Now
            };
            await _repository.AddAsync(config);
        }
        else
        {
            config.ClaveLicencia = token;
            config.FechaExpiracionLicencia = datos.Expiracion;
            config.UltimoAccesoRegistrado = DateTime.Now;
            await _repository.UpdateAsync(config);
        }

        return await GetStatusAsync();
    }

    public async Task<bool> ValidarEscrituraAsync()
    {
        var all = await _repository.GetAllAsync();
        var config = all.FirstOrDefault();
        var now = DateTime.Now;
        var estado = EvaluarEstadoLicencia(config, now);
        return estado == EstadoLicencia.Activa;
    }

    public async Task ActualizarUltimoAccesoAsync()
    {
        var all = await _repository.GetAllAsync();
        var config = all.FirstOrDefault();
        if (config != null)
        {
            await ActualizarUltimoAcceso(config, DateTime.Now);
        }
    }

    private EstadoLicencia EvaluarEstadoLicencia(ConfiguracionTaller? config, DateTime now)
    {
        if (config == null || !config.FechaExpiracionLicencia.HasValue)
            return EstadoLicencia.Vencida;

        if (config.UltimoAccesoRegistrado.HasValue && now < config.UltimoAccesoRegistrado.Value.AddMinutes(-5))
            return EstadoLicencia.RelojAtrasado;

        if (config.FechaExpiracionLicencia.Value < now)
            return EstadoLicencia.Vencida;

        return EstadoLicencia.Activa;
    }

    private async Task ActualizarUltimoAcceso(ConfiguracionTaller? config, DateTime now)
    {
        if (config == null) return;

        if (config.UltimoAccesoRegistrado.HasValue && now < config.UltimoAccesoRegistrado.Value.AddMinutes(-5))
            return;

        config.UltimoAccesoRegistrado = now;
        try
        {
            await _repository.UpdateAsync(config);
        }
        catch { }
    }

    private int? CalcularDiasRestantes(ConfiguracionTaller? config, DateTime now)
    {
        if (config?.FechaExpiracionLicencia == null) return null;
        var diff = config.FechaExpiracionLicencia.Value - now;
        if (diff.TotalMinutes <= 0) return 0;
        return (int)Math.Ceiling(diff.TotalDays);
    }

    private int? CalcularMinutosRestantes(ConfiguracionTaller? config, DateTime now)
    {
        if (config?.FechaExpiracionLicencia == null) return null;
        var diff = config.FechaExpiracionLicencia.Value - now;
        if (diff.TotalMinutes <= 0) return 0;
        return (int)Math.Ceiling(diff.TotalMinutes);
    }

    private LicenciaTokenData? DesencriptarToken(string tokenEncriptado)
    {
        try
        {
            var fullKey = _secretPhrase;
            using var sha256 = SHA256.Create();
            var keyBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(fullKey));
            var iv = new byte[16];
            Array.Copy(keyBytes, iv, 16);

            var cipherBytes = Convert.FromBase64String(tokenEncriptado);
            using var aes = Aes.Create();
            aes.Key = keyBytes;
            aes.IV = iv;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            using var decryptor = aes.CreateDecryptor();
            var plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);
            var json = Encoding.UTF8.GetString(plainBytes);

            var datos = JsonSerializer.Deserialize<LicenciaTokenData>(json);
            if (datos == null || datos.Expiracion == default) return null;

            if (datos.Producto != "TallerMecanico") return null;

            return datos;
        }
        catch
        {
            return null;
        }
    }

    private class LicenciaTokenData
    {
        public DateTime Expiracion { get; set; }
        public string Producto { get; set; } = "";
    }
}
