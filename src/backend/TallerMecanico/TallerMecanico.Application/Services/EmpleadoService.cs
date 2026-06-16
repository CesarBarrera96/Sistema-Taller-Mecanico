using AutoMapper;
using TallerMecanico.Application.DTOs.Empleados;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Interfaces;

namespace TallerMecanico.Application.Services;

public class EmpleadoService : IEmpleadoService
{
    private readonly IRepository<Empleado> _repository;
    private readonly IMapper _mapper;

    public EmpleadoService(IRepository<Empleado> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<EmpleadoDto>> GetAllAsync()
    {
        var empleados = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<EmpleadoDto>>(empleados);
    }

    public async Task<EmpleadoDto?> GetByIdAsync(int id)
    {
        var empleado = await _repository.GetByIdAsync(id);
        return empleado == null ? null : _mapper.Map<EmpleadoDto>(empleado);
    }

    public async Task<EmpleadoDto> CreateAsync(CreateEmpleadoDto dto)
    {
        var empleado = _mapper.Map<Empleado>(dto);
        await _repository.AddAsync(empleado);
        return _mapper.Map<EmpleadoDto>(empleado);
    }

    public async Task<EmpleadoDto> UpdateAsync(int id, UpdateEmpleadoDto dto)
    {
        var empleado = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Empleado {id} no encontrado");

        _mapper.Map(dto, empleado);
        if (dto.Activo.HasValue) empleado.Activo = dto.Activo.Value;
        await _repository.UpdateAsync(empleado);
        return _mapper.Map<EmpleadoDto>(empleado);
    }

    public async Task DeleteAsync(int id)
    {
        var empleado = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Empleado {id} no encontrado");

        await _repository.DeleteAsync(empleado);
    }
}
