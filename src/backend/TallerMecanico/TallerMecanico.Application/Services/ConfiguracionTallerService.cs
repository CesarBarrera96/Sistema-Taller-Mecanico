using AutoMapper;
using TallerMecanico.Application.DTOs.Configuracion;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Interfaces;

namespace TallerMecanico.Application.Services;

public class ConfiguracionTallerService : IConfiguracionTallerService
{
    private readonly IRepository<ConfiguracionTaller> _repository;
    private readonly IMapper _mapper;

    public ConfiguracionTallerService(IRepository<ConfiguracionTaller> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<ConfiguracionTallerDto> GetAsync()
    {
        var all = await _repository.GetAllAsync();
        var config = all.FirstOrDefault() ?? new ConfiguracionTaller { Nombre = "Taller Mecanico" };
        return _mapper.Map<ConfiguracionTallerDto>(config);
    }

    public async Task<ConfiguracionTallerDto> UpdateAsync(UpdateConfiguracionTallerDto dto)
    {
        var all = await _repository.GetAllAsync();
        var config = all.FirstOrDefault();

        if (config == null)
        {
            config = _mapper.Map<ConfiguracionTaller>(dto);
            await _repository.AddAsync(config);
        }
        else
        {
            _mapper.Map(dto, config);
            await _repository.UpdateAsync(config);
        }

        return _mapper.Map<ConfiguracionTallerDto>(config);
    }

    public async Task<string> UploadLogoAsync(Stream fileStream, string fileName)
    {
        var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
        if (!Directory.Exists(uploadsDir))
            Directory.CreateDirectory(uploadsDir);

        var ext = Path.GetExtension(fileName);
        var uniqueName = $"logo_{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(uploadsDir, uniqueName);

        using (var fs = new FileStream(filePath, FileMode.Create))
        {
            await fileStream.CopyToAsync(fs);
        }

        var all = await _repository.GetAllAsync();
        var config = all.FirstOrDefault();

        if (config == null)
        {
            config = new ConfiguracionTaller
            {
                Nombre = "Taller Mecanico",
                LogoRuta = $"/uploads/{uniqueName}"
            };
            await _repository.AddAsync(config);
        }
        else
        {
            if (!string.IsNullOrEmpty(config.LogoRuta))
            {
                var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", config.LogoRuta.TrimStart('/'));
                if (File.Exists(oldPath))
                    File.Delete(oldPath);
            }
            config.LogoRuta = $"/uploads/{uniqueName}";
            await _repository.UpdateAsync(config);
        }

        return $"/uploads/{uniqueName}";
    }

    public async Task DeleteLogoAsync()
    {
        var all = await _repository.GetAllAsync();
        var config = all.FirstOrDefault();

        if (config != null && !string.IsNullOrEmpty(config.LogoRuta))
        {
            var oldPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", config.LogoRuta.TrimStart('/'));
            if (File.Exists(oldPath))
                File.Delete(oldPath);

            config.LogoRuta = null;
            await _repository.UpdateAsync(config);
        }
    }
}
