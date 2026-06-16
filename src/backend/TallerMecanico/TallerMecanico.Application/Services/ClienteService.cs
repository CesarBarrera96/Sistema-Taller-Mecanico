using AutoMapper;
using TallerMecanico.Application.DTOs.Clientes;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Interfaces;

namespace TallerMecanico.Application.Services;

public class ClienteService : IClienteService
{
    private readonly IRepository<Cliente> _repository;
    private readonly IMapper _mapper;

    public ClienteService(IRepository<Cliente> repository, IMapper mapper)
    {
        _repository = repository;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ClienteDto>> GetAllAsync()
    {
        var clientes = await _repository.GetAllAsync();
        return _mapper.Map<IEnumerable<ClienteDto>>(clientes);
    }

    public async Task<ClienteDto?> GetByIdAsync(int id)
    {
        var cliente = await _repository.GetByIdAsync(id);
        return cliente == null ? null : _mapper.Map<ClienteDto>(cliente);
    }

    public async Task<ClienteDto> CreateAsync(CreateClienteDto dto)
    {
        var cliente = _mapper.Map<Cliente>(dto);
        await _repository.AddAsync(cliente);
        return _mapper.Map<ClienteDto>(cliente);
    }

    public async Task<ClienteDto> UpdateAsync(int id, UpdateClienteDto dto)
    {
        var cliente = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Cliente {id} no encontrado");

        _mapper.Map(dto, cliente);
        await _repository.UpdateAsync(cliente);
        return _mapper.Map<ClienteDto>(cliente);
    }

    public async Task<ClienteDto> ToggleActivoAsync(int id)
    {
        var cliente = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Cliente {id} no encontrado");

        cliente.Activo = !cliente.Activo;
        await _repository.UpdateAsync(cliente);
        return _mapper.Map<ClienteDto>(cliente);
    }

    public async Task DeleteAsync(int id)
    {
        var cliente = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Cliente {id} no encontrado");

        await _repository.DeleteAsync(cliente);
    }
}
