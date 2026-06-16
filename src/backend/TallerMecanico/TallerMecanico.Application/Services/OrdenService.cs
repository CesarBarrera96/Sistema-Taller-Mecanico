using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TallerMecanico.Application.DTOs.Ordenes;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Enums;
using TallerMecanico.Domain.Interfaces;

namespace TallerMecanico.Application.Services;

public class OrdenService : IOrdenService
{
    private readonly IRepository<OrdenTrabajo> _repository;
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public OrdenService(IRepository<OrdenTrabajo> repository, IApplicationDbContext context, IMapper mapper)
    {
        _repository = repository;
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<OrdenTrabajoDto>> GetAllAsync()
    {
    var ordenes = await _context.OrdenesTrabajo
        .Include(o => o.Cliente).Include(o => o.Vehiculo)
        .Include(o => o.EmpleadoRecibe).Include(o => o.EmpleadoAsignado)
        .Include(o => o.Detalles).ThenInclude(d => d.Servicio)
        .Include(o => o.Detalles).ThenInclude(d => d.Refaccion)
        .OrderByDescending(o => o.Id).ToListAsync();

        return _mapper.Map<IEnumerable<OrdenTrabajoDto>>(ordenes);
    }

    public async Task<OrdenTrabajoDto?> GetByIdAsync(int id)
    {
        var orden = await _context.OrdenesTrabajo
            .Include(o => o.Cliente).Include(o => o.Vehiculo)
            .Include(o => o.EmpleadoRecibe).Include(o => o.EmpleadoAsignado)
            .Include(o => o.Detalles).ThenInclude(d => d.Servicio)
            .Include(o => o.Detalles).ThenInclude(d => d.Refaccion)
            .FirstOrDefaultAsync(o => o.Id == id);

        return orden == null ? null : _mapper.Map<OrdenTrabajoDto>(orden);
    }

    public async Task<IEnumerable<OrdenTrabajoDto>> GetByEstatusAsync(EstatusOrden estatus)
    {
        var ordenes = await _context.OrdenesTrabajo
            .Include(o => o.Cliente).Include(o => o.Vehiculo)
            .Include(o => o.EmpleadoRecibe).Include(o => o.EmpleadoAsignado)
            .Include(o => o.Detalles)
        .Where(o => o.Estatus == estatus)
        .OrderByDescending(o => o.Id).ToListAsync();

        return _mapper.Map<IEnumerable<OrdenTrabajoDto>>(ordenes);
    }

    public async Task<OrdenTrabajoDto> CreateAsync(CreateOrdenTrabajoDto dto)
    {
        var orden = _mapper.Map<OrdenTrabajo>(dto);
        orden.Folio = await GenerarFolioAsync();
        orden.FechaEntrada = DateTime.Now;
        orden.Estatus = EstatusOrden.Recibida;

        foreach (var detalleDto in dto.Detalles)
        {
            var detalle = new OrdenDetalle
            {
                OrdenTrabajo = orden,
                Tipo = Enum.Parse<TipoDetalleOrden>(detalleDto.Tipo)
            };

            if (detalle.Tipo == TipoDetalleOrden.Servicio && detalleDto.ServicioId.HasValue)
            {
                var servicio = await _context.Servicios.FindAsync(detalleDto.ServicioId.Value)
                    ?? throw new KeyNotFoundException($"Servicio {detalleDto.ServicioId} no encontrado");

                detalle.ServicioId = servicio.Id;
                detalle.PrecioUnitario = servicio.PrecioManoObra;
                detalle.Cantidad = 1;
                detalle.Subtotal = servicio.PrecioManoObra;
                orden.TotalManoObra += detalle.Subtotal;
            }
            else if (detalle.Tipo == TipoDetalleOrden.Refaccion && detalleDto.RefaccionId.HasValue)
            {
                var refaccion = await _context.Refacciones.FindAsync(detalleDto.RefaccionId.Value)
                    ?? throw new KeyNotFoundException($"Refacción {detalleDto.RefaccionId} no encontrado");

                if (refaccion.StockActual < detalleDto.Cantidad)
                    throw new InvalidOperationException($"Stock insuficiente para {refaccion.Nombre}");

                detalle.RefaccionId = refaccion.Id;
                detalle.PrecioUnitario = refaccion.PrecioVenta;
                detalle.Cantidad = detalleDto.Cantidad;
                detalle.Subtotal = refaccion.PrecioVenta * detalleDto.Cantidad;
                orden.TotalRefacciones += detalle.Subtotal;

                refaccion.StockActual -= (int)detalle.Cantidad;

                _context.InventarioMovimientos.Add(new InventarioMovimiento
                {
                    RefaccionId = refaccion.Id,
                    TipoMovimiento = TipoMovimiento.Salida,
                    Cantidad = (int)detalle.Cantidad,
                    PrecioUnitario = refaccion.PrecioVenta,
                    Motivo = $"Uso en OT: {orden.Folio}",
                    FechaMovimiento = DateTime.Now
                });
            }

            detalle.Notas = detalleDto.Notas;
            orden.Detalles.Add(detalle);
        }

        orden.Total = orden.TotalManoObra + orden.TotalRefacciones;
        await _repository.AddAsync(orden);

        var saved = await _context.OrdenesTrabajo
            .Include(o => o.Cliente).Include(o => o.Vehiculo)
            .Include(o => o.EmpleadoRecibe).Include(o => o.EmpleadoAsignado)
            .Include(o => o.Detalles).ThenInclude(d => d.Servicio)
            .Include(o => o.Detalles).ThenInclude(d => d.Refaccion)
            .FirstOrDefaultAsync(o => o.Id == orden.Id);
        return _mapper.Map<OrdenTrabajoDto>(saved);
    }

    public async Task<OrdenTrabajoDto> UpdateAsync(int id, UpdateOrdenTrabajoDto dto)
    {
        var orden = await _context.OrdenesTrabajo.Include(o => o.Detalles).FirstOrDefaultAsync(o => o.Id == id)
            ?? throw new KeyNotFoundException($"Orden {id} no encontrada");

        if (dto.Estatus.HasValue) orden.Estatus = dto.Estatus.Value;
        if (dto.EmpleadoAsignadoId.HasValue) orden.EmpleadoAsignadoId = dto.EmpleadoAsignadoId;
        if (dto.FechaPrometida.HasValue) orden.FechaPrometida = dto.FechaPrometida;
        if (dto.FechaEntrega.HasValue) orden.FechaEntrega = dto.FechaEntrega;
        if (dto.Diagnostico != null) orden.Diagnostico = dto.Diagnostico;
        if (dto.Observaciones != null) orden.Observaciones = dto.Observaciones;
        if (dto.Total.HasValue) orden.Total = dto.Total.Value;

        await _repository.UpdateAsync(orden);

        return _mapper.Map<OrdenTrabajoDto>(orden);
    }

    public async Task DeleteAsync(int id)
    {
        var orden = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Orden {id} no encontrada");

        await _repository.DeleteAsync(orden);
    }

    private async Task<string> GenerarFolioAsync()
    {
        var year = DateTime.Now.Year;
        var count = await _context.OrdenesTrabajo
            .CountAsync(o => o.FechaEntrada.Year == year);
        return $"OT-{year}-{(count + 1):D4}";
    }
}
