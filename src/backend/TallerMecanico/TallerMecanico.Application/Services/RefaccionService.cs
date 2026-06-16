using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TallerMecanico.Application.DTOs.Refacciones;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Enums;
using TallerMecanico.Domain.Interfaces;

namespace TallerMecanico.Application.Services;

public class RefaccionService : IRefaccionService
{
    private readonly IRepository<Refaccion> _repository;
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public RefaccionService(IRepository<Refaccion> repository, IApplicationDbContext context, IMapper mapper)
    {
        _repository = repository;
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<RefaccionDto>> GetAllAsync()
    {
        var refacciones = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<RefaccionDto>>(refacciones);
    }

    public async Task<RefaccionDto?> GetByIdAsync(int id)
    {
        var refaccion = await _repository.GetByIdAsync(id);
        return refaccion == null ? null : _mapper.Map<RefaccionDto>(refaccion);
    }

    public async Task<RefaccionDto> CreateAsync(CreateRefaccionDto dto)
    {
        var refaccion = _mapper.Map<Refaccion>(dto);
        await _repository.AddAsync(refaccion);
        return _mapper.Map<RefaccionDto>(refaccion);
    }

    public async Task<RefaccionDto> UpdateAsync(int id, UpdateRefaccionDto dto)
    {
        var refaccion = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Refacción {id} no encontrada");

        _mapper.Map(dto, refaccion);
        await _repository.UpdateAsync(refaccion);
        return _mapper.Map<RefaccionDto>(refaccion);
    }

    public async Task DeleteAsync(int id)
    {
        var refaccion = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Refacción {id} no encontrada");

        await _repository.DeleteAsync(refaccion);
    }

    public async Task<RefaccionDto> RegistrarMovimientoAsync(InventarioMovimientoDto dto)
    {
        var refaccion = await _repository.GetByIdAsync(dto.RefaccionId)
            ?? throw new KeyNotFoundException($"Refacción {dto.RefaccionId} no encontrada");

        var tipoMovimiento = Enum.Parse<TipoMovimiento>(dto.TipoMovimiento);

        if (tipoMovimiento == TipoMovimiento.Salida && refaccion.StockActual < dto.Cantidad)
            throw new InvalidOperationException("Stock insuficiente");

        var movimiento = new InventarioMovimiento
        {
            RefaccionId = refaccion.Id,
            TipoMovimiento = tipoMovimiento,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario,
            Motivo = dto.Motivo,
            FechaMovimiento = DateTime.Now
        };

        refaccion.StockActual += tipoMovimiento switch
        {
            TipoMovimiento.Entrada => dto.Cantidad,
            TipoMovimiento.Salida => -dto.Cantidad,
            TipoMovimiento.Ajuste => dto.Cantidad,
            _ => 0
        };

        _context.InventarioMovimientos.Add(movimiento);
        await _repository.UpdateAsync(refaccion);

        return _mapper.Map<RefaccionDto>(refaccion);
    }

    public async Task<IEnumerable<RefaccionDto>> GetStockBajoAsync()
    {
        var refacciones = await _context.Refacciones
            .Where(r => r.StockActual <= r.StockMinimo && r.Activo).ToListAsync();
        return _mapper.Map<IEnumerable<RefaccionDto>>(refacciones);
    }
}
