using Microsoft.AspNetCore.Mvc;
using TallerMecanico.Application.DTOs.Facturas;
using TallerMecanico.Application.Interfaces;

namespace TallerMecanico.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FacturasController : ControllerBase
{
    private readonly IFacturaService _service;
    private readonly IFacturaPdfService _pdfService;

    public FacturasController(IFacturaService service, IFacturaPdfService pdfService)
    {
        _service = service;
        _pdfService = pdfService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FacturaDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FacturaDto>> GetById(int id)
    {
        var result = await _service.GetByIdAsync(id);
        return result == null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<FacturaDto>> Create(CreateFacturaDto dto)
    {
        var result = await _service.CreateFromOrdenAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPost("{id}/pagar")]
    public async Task<ActionResult<FacturaDto>> Pagar(int id, PagarFacturaDto dto)
    {
        var result = await _service.PagarAsync(id, dto);
        return Ok(result);
    }

    [HttpPost("{id}/cancelar")]
    public async Task<ActionResult<FacturaDto>> Cancelar(int id)
    {
        var result = await _service.CancelarAsync(id);
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<FacturaDto>> Update(int id, UpdateFacturaDto dto)
    {
        var result = await _service.UpdateAsync(id, dto);
        return Ok(result);
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> GetPdf(int id)
    {
        var data = await _service.GetPdfDataAsync(id);
        var pdfBytes = _pdfService.GeneratePdf(data);

        var configIncomplete = string.IsNullOrWhiteSpace(data.TallerNombre) || data.TallerNombre == "Taller Mecanico";
        if (configIncomplete)
            Response.Headers.Append("X-Config-Incomplete", "true");

        return File(pdfBytes, "application/pdf", $"Factura_{data.Folio}.pdf");
    }
}
