using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TallerMecanico.Application.DTOs.Facturas;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Enums;
using TallerMecanico.Domain.Interfaces;

namespace TallerMecanico.Application.Services;

public class FacturaService : IFacturaService
{
    private readonly IRepository<Factura> _repository;
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;
    private readonly IConfiguracionTallerService _configService;
    private const decimal IvaRate = 0.16m;

    public FacturaService(IRepository<Factura> repository, IApplicationDbContext context, IMapper mapper, IConfiguracionTallerService configService)
    {
        _repository = repository;
        _context = context;
        _mapper = mapper;
        _configService = configService;
    }

    public async Task<IEnumerable<FacturaDto>> GetAllAsync()
    {
        var facturas = await _context.Facturas
        .Include(f => f.Cliente).Include(f => f.OrdenTrabajo).Include(f => f.Detalles)
        .OrderByDescending(f => f.Id).ToListAsync();
        return _mapper.Map<IEnumerable<FacturaDto>>(facturas);
    }

    public async Task<FacturaDto?> GetByIdAsync(int id)
    {
        var factura = await _context.Facturas
            .Include(f => f.Cliente).Include(f => f.OrdenTrabajo).Include(f => f.Detalles)
            .FirstOrDefaultAsync(f => f.Id == id);
        return factura == null ? null : _mapper.Map<FacturaDto>(factura);
    }

    public async Task<FacturaDto> CreateFromOrdenAsync(CreateFacturaDto dto)
    {
        var orden = await _context.OrdenesTrabajo
            .Include(o => o.Detalles).ThenInclude(d => d.Servicio)
            .Include(o => o.Detalles).ThenInclude(d => d.Refaccion)
            .FirstOrDefaultAsync(o => o.Id == dto.OrdenTrabajoId)
            ?? throw new KeyNotFoundException($"Orden {dto.OrdenTrabajoId} no encontrada");

        if (await _context.Facturas.AnyAsync(f => f.OrdenTrabajoId == dto.OrdenTrabajoId))
            throw new InvalidOperationException("Ya existe una factura para esta orden");

        var year = DateTime.Now.Year;
        var count = await _context.Facturas.CountAsync(f => f.FechaFacturacion.Year == year);

        var subtotal = orden.Total / (1 + IvaRate);
        var iva = orden.Total - subtotal;
        var total = orden.Total;

        var factura = new Factura
        {
            Folio = $"FAC-{year}-{(count + 1):D4}",
            OrdenTrabajoId = orden.Id,
            ClienteId = orden.ClienteId,
            FechaFacturacion = DateTime.Now,
            Subtotal = subtotal,
            IVA = iva,
            Total = total,
            Estatus = EstatusFactura.Pendiente,
            MetodoPago = dto.MetodoPago,
            Observaciones = dto.Observaciones
        };

        factura.Detalles.Add(new FacturaDetalle
        {
            Concepto = orden.Diagnostico ?? orden.Folio,
            Cantidad = 1,
            PrecioUnitario = subtotal,
            Subtotal = subtotal
        });

        await _repository.AddAsync(factura);

        var saved = await _context.Facturas
            .Include(f => f.Cliente).Include(f => f.OrdenTrabajo).Include(f => f.Detalles)
            .FirstOrDefaultAsync(f => f.Id == factura.Id);
        return _mapper.Map<FacturaDto>(saved);
    }

    public async Task<FacturaDto> PagarAsync(int id, PagarFacturaDto dto)
    {
        var factura = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Factura {id} no encontrada");

        if (factura.Estatus == EstatusFactura.Pagada)
            throw new InvalidOperationException("La factura ya está pagada");

        factura.Estatus = EstatusFactura.Pagada;
        factura.MetodoPago = dto.MetodoPago;
        factura.FechaPago = DateTime.Now;

        await _repository.UpdateAsync(factura);
        return _mapper.Map<FacturaDto>(factura);
    }

    public async Task<FacturaDto> CancelarAsync(int id)
    {
        var factura = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Factura {id} no encontrada");

        factura.Estatus = EstatusFactura.Cancelada;

        await _repository.UpdateAsync(factura);
        return _mapper.Map<FacturaDto>(factura);
    }

    public async Task<FacturaDto> UpdateAsync(int id, UpdateFacturaDto dto)
    {
        var factura = await _context.Facturas
            .Include(f => f.Detalles)
            .FirstOrDefaultAsync(f => f.Id == id)
            ?? throw new KeyNotFoundException($"Factura {id} no encontrada");

        if (dto.MetodoPago is not null) factura.MetodoPago = dto.MetodoPago;
        if (dto.Observaciones is not null) factura.Observaciones = dto.Observaciones;

        if (dto.Detalles is not null && dto.Detalles.Count > 0)
        {
            foreach (var detalleDto in dto.Detalles)
            {
                var detalle = factura.Detalles.FirstOrDefault(d => d.Id == detalleDto.Id);
                if (detalle != null)
                {
                    detalle.Concepto = detalleDto.Concepto;
                    detalle.Cantidad = detalleDto.Cantidad;
                    detalle.PrecioUnitario = detalleDto.PrecioUnitario;
                    detalle.Subtotal = detalleDto.Cantidad * detalleDto.PrecioUnitario;
                }
            }

            factura.Subtotal = factura.Detalles.Sum(d => d.Subtotal);
            factura.IVA = factura.Subtotal * IvaRate;
            factura.Total = factura.Subtotal + factura.IVA;
        }

        await _repository.UpdateAsync(factura);

        var saved = await _context.Facturas
            .Include(f => f.Cliente).Include(f => f.OrdenTrabajo).Include(f => f.Detalles)
            .FirstOrDefaultAsync(f => f.Id == factura.Id);
        return _mapper.Map<FacturaDto>(saved);
    }

    public async Task<FacturaPdfData> GetPdfDataAsync(int id)
    {
        var factura = await _context.Facturas
            .Include(f => f.Cliente)
            .Include(f => f.OrdenTrabajo).ThenInclude(o => o.Vehiculo)
            .Include(f => f.Detalles)
            .FirstOrDefaultAsync(f => f.Id == id)
            ?? throw new KeyNotFoundException($"Factura {id} no encontrada");

        var config = await _configService.GetAsync();

        var vehiculo = factura.OrdenTrabajo.Vehiculo;
        var cliente = factura.Cliente;

        return new FacturaPdfData
        {
            Folio = factura.Folio,
            FechaFacturacion = factura.FechaFacturacion,
            Estatus = factura.Estatus,
            TallerNombre = config.Nombre,
            TallerRfc = config.Rfc,
            TallerTelefono = config.Telefono,
            TallerDireccion = config.Direccion,
            TallerLogoRuta = config.LogoRuta,
            TallerLeyenda = config.LeyendaPiePagina,
            ClienteNombre = $"{cliente.Nombre} {cliente.ApellidoPaterno}{(cliente.ApellidoMaterno != null ? " " + cliente.ApellidoMaterno : "")}",
            ClienteTelefono = cliente.Telefono,
            ClienteEmail = cliente.Email,
            ClienteRfc = cliente.RFC,
            ClienteDireccion = cliente.Direccion,
            VehiculoDescripcion = $"{vehiculo.Marca} {vehiculo.Modelo}",
            VehiculoPlacas = vehiculo.Placas,
            VehiculoColor = vehiculo.Color,
            VehiculoAnio = vehiculo.Anio,
            VehiculoVin = vehiculo.VIN,
            Detalles = factura.Detalles.Select(d => new FacturaDetallePdf
            {
                Concepto = d.Concepto,
                Cantidad = d.Cantidad,
                PrecioUnitario = d.PrecioUnitario,
                Subtotal = d.Subtotal
            }).ToList(),
            Subtotal = factura.Subtotal,
            IVA = factura.IVA,
            Total = factura.Total
        };
    }
}
