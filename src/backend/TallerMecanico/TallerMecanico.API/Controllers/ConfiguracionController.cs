using Microsoft.AspNetCore.Mvc;
using TallerMecanico.Application.DTOs.Configuracion;
using TallerMecanico.Application.Interfaces;

namespace TallerMecanico.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfiguracionController : ControllerBase
{
    private readonly IConfiguracionTallerService _service;

    public ConfiguracionController(IConfiguracionTallerService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<ConfiguracionTallerDto>> Get()
    {
        var result = await _service.GetAsync();
        return Ok(result);
    }

    [HttpPut]
    public async Task<ActionResult<ConfiguracionTallerDto>> Update(UpdateConfiguracionTallerDto dto)
    {
        var result = await _service.UpdateAsync(dto);
        return Ok(result);
    }

    [HttpPost("logo")]
    public async Task<ActionResult<object>> UploadLogo([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { mensaje = "No se proporciono archivo" });

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp" };
        var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(ext))
            return BadRequest(new { mensaje = "Formato de imagen no permitido" });

        using var stream = file.OpenReadStream();
        var logoRuta = await _service.UploadLogoAsync(stream, file.FileName);
        return Ok(new { logoRuta });
    }

    [HttpDelete("logo")]
    public async Task<ActionResult> DeleteLogo()
    {
        await _service.DeleteLogoAsync();
        return NoContent();
    }
}
