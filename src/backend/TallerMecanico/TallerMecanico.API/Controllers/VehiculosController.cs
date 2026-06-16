using Microsoft.AspNetCore.Mvc;
using TallerMecanico.Application.DTOs.Vehiculos;
using TallerMecanico.Application.Interfaces;

namespace TallerMecanico.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VehiculosController : ControllerBase
{
    private readonly IVehiculoService _service;

    public VehiculosController(IVehiculoService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<VehiculoDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<VehiculoDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpGet("cliente/{clienteId}")]
    public async Task<ActionResult<IEnumerable<VehiculoDto>>> GetByCliente(int clienteId)
    {
        var result = await _service.GetByClienteIdAsync(clienteId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<VehiculoDto>> Create(CreateVehiculoDto dto)
    {
        var result = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<VehiculoDto>> Update(int id, UpdateVehiculoDto dto)
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
