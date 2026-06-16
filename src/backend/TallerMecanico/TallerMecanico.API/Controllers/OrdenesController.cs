using Microsoft.AspNetCore.Mvc;
using TallerMecanico.Application.DTOs.Ordenes;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Domain.Enums;

namespace TallerMecanico.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdenesController : ControllerBase
{
    private readonly IOrdenService _service;

    public OrdenesController(IOrdenService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<OrdenTrabajoDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<OrdenTrabajoDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("estatus/{estatus}")]
    public async Task<ActionResult<IEnumerable<OrdenTrabajoDto>>> GetByEstatus(EstatusOrden estatus)
    {
        var result = await _service.GetByEstatusAsync(estatus);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<OrdenTrabajoDto>> Create(CreateOrdenTrabajoDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<OrdenTrabajoDto>> Update(int id, UpdateOrdenTrabajoDto dto)
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
}
