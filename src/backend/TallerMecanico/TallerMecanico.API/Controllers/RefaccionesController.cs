using Microsoft.AspNetCore.Mvc;
using TallerMecanico.Application.DTOs.Refacciones;
using TallerMecanico.Application.Interfaces;

namespace TallerMecanico.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RefaccionesController : ControllerBase
{
    private readonly IRefaccionService _service;

    public RefaccionesController(IRefaccionService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RefaccionDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<RefaccionDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("stock-bajo")]
    public async Task<ActionResult<IEnumerable<RefaccionDto>>> GetStockBajo()
    {
        var result = await _service.GetStockBajoAsync();
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<RefaccionDto>> Create(CreateRefaccionDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<RefaccionDto>> Update(int id, UpdateRefaccionDto dto)
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

    [HttpPost("movimiento")]
    public async Task<ActionResult<RefaccionDto>> RegistrarMovimiento(InventarioMovimientoDto dto)
    {
        var result = await _service.RegistrarMovimientoAsync(dto);
        return Ok(result);
    }
}
