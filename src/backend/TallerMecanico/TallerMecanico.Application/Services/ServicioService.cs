using AutoMapper;
using TallerMecanico.Application.DTOs.Servicios;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Interfaces;

namespace TallerMecanico.Application.Services;

public class ServicioService : IServicioService
{
    private readonly IRepository<Servicio> _repository;
    private readonly IMapper _mapper;

    public ServicioService(IRepository<Servicio> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ServicioDto>> GetAllAsync()
    {
        var servicios = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<ServicioDto>>(servicios);
    }

    public async Task<ServicioDto?> GetByIdAsync(int id)
    {
        var servicio = await _repository.GetByIdAsync(id);
        return servicio == null ? null : _mapper.Map<ServicioDto>(servicio);
    }

    public async Task<ServicioDto> CreateAsync(CreateServicioDto dto)
    {
        var servicio = _mapper.Map<Servicio>(dto);
        await _repository.AddAsync(servicio);
        return _mapper.Map<ServicioDto>(servicio);
    }

    public async Task<ServicioDto> UpdateAsync(int id, UpdateServicioDto dto)
    {
        var servicio = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Servicio {id} no encontrado");

        _mapper.Map(dto, servicio);
        await _repository.UpdateAsync(servicio);
        return _mapper.Map<ServicioDto>(servicio);
    }

    public async Task DeleteAsync(int id)
    {
        var servicio = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Servicio {id} no encontrado");

        await _repository.DeleteAsync(servicio);
    }
}
