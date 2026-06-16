using Microsoft.AspNetCore.Mvc;
using TallerMecanico.Application.DTOs.Citas;
using TallerMecanico.Application.Interfaces;

namespace TallerMecanico.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CitasController : ControllerBase
{
    private readonly ICitaService _service;

    public CitasController(ICitaService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CitaDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CitaDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("fecha/{fecha}")]
    public async Task<ActionResult<IEnumerable<CitaDto>>> GetByFecha(string fecha)
    {
        var result = await _service.GetByFechaAsync(fecha);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<CitaDto>> Create(CreateCitaDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CitaDto>> Update(int id, UpdateCitaDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return Ok(result);
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/convertir-orden")]
    public async Task<ActionResult<CitaDto>> ConvertirAOrden(int id)
    {
        var result = await _service.ConvertirAOrdenAsync(id);
        return Ok(result);
    }
}
