using Microsoft.AspNetCore.Mvc;
using TallerMecanico.Application.DTOs.Licencia;
using TallerMecanico.Application.Interfaces;

namespace TallerMecanico.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LicenciaController : ControllerBase
{
    private readonly ILicenciaService _service;

    public LicenciaController(ILicenciaService service)
    {
        _service = service;
    }

    [HttpGet("status")]
    public async Task<ActionResult<LicenciaStatusDto>> GetStatus()
    {
        var result = await _service.GetStatusAsync();
        return Ok(result);
    }

    [HttpPost("activar")]
    public async Task<ActionResult<LicenciaStatusDto>> Activar([FromBody] ActivarLicenciaDto dto)
    {
        var result = await _service.ActivarAsync(dto.Token);
        return Ok(result);
    }
}
