using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TallerMecanico.Application.DTOs.Vehiculos;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Interfaces;

namespace TallerMecanico.Application.Services;

public class VehiculoService : IVehiculoService
{
    private readonly IRepository<Vehiculo> _repository;
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public VehiculoService(IRepository<Vehiculo> repository, IApplicationDbContext context, IMapper mapper)
    {
        _repository = repository;
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<VehiculoDto>> GetAllAsync()
    {
        var vehiculos = await _context.Vehiculos.Include(v => v.Cliente).OrderByDescending(v => v.Id).ToListAsync();
        return _mapper.Map<IEnumerable<VehiculoDto>>(vehiculos);
    }

    public async Task<VehiculoDto?> GetByIdAsync(int id)
    {
        var vehiculo = await _context.Vehiculos.Include(v => v.Cliente).FirstOrDefaultAsync(v => v.Id == id);
        return vehiculo == null ? null : _mapper.Map<VehiculoDto>(vehiculo);
    }

    public async Task<IEnumerable<VehiculoDto>> GetByClienteIdAsync(int clienteId)
    {
        var vehiculos = await _context.Vehiculos.Include(v => v.Cliente)
            .Where(v => v.ClienteId == clienteId).ToListAsync();
        return _mapper.Map<IEnumerable<VehiculoDto>>(vehiculos);
    }

    public async Task<VehiculoDto> CreateAsync(CreateVehiculoDto dto)
    {
        var vehiculo = _mapper.Map<Vehiculo>(dto);
        await _repository.AddAsync(vehiculo);

        var saved = await _context.Vehiculos.Include(v => v.Cliente).FirstOrDefaultAsync(v => v.Id == vehiculo.Id);
        return _mapper.Map<VehiculoDto>(saved);
    }

    public async Task<VehiculoDto> UpdateAsync(int id, UpdateVehiculoDto dto)
    {
        var vehiculo = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Vehículo {id} no encontrado");

        _mapper.Map(dto, vehiculo);
        await _repository.UpdateAsync(vehiculo);
        return _mapper.Map<VehiculoDto>(vehiculo);
    }

    public async Task DeleteAsync(int id)
    {
        var vehiculo = await _context.Vehiculos
            .Include(v => v.OrdenesTrabajo)
            .Include(v => v.Citas)
            .FirstOrDefaultAsync(v => v.Id == id)
            ?? throw new KeyNotFoundException($"Vehículo {id} no encontrado");

        if (vehiculo.OrdenesTrabajo.Any())
            throw new InvalidOperationException("No se puede eliminar el vehículo porque tiene órdenes de trabajo asociadas");

        if (vehiculo.Citas.Any())
            throw new InvalidOperationException("No se puede eliminar el vehículo porque tiene citas asociadas");

        await _repository.DeleteAsync(vehiculo);
    }
}
