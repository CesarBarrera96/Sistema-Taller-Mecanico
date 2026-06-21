using AutoMapper;
using Microsoft.EntityFrameworkCore;
using TallerMecanico.Application.DTOs.Citas;
using TallerMecanico.Application.Interfaces;
using TallerMecanico.Domain.Entities;
using TallerMecanico.Domain.Enums;
using TallerMecanico.Domain.Interfaces;

namespace TallerMecanico.Application.Services;

public class CitaService : ICitaService
{
    private readonly IRepository<Cita> _repository;
    private readonly IApplicationDbContext _context;
    private readonly IMapper _mapper;

    public CitaService(IRepository<Cita> repository, IApplicationDbContext context, IMapper mapper)
    {
        _repository = repository;
        _context = context;
        _mapper = mapper;
    }

    public async Task<IEnumerable<CitaDto>> GetAllAsync()
    {
        var citas = await _context.Citas
        .Include(c => c.Cliente).Include(c => c.Vehiculo).Include(c => c.Empleado)
        .OrderByDescending(c => c.Id).ToListAsync();
        return _mapper.Map<IEnumerable<CitaDto>>(citas);
    }

    public async Task<CitaDto?> GetByIdAsync(int id)
    {
        var cita = await _context.Citas
            .Include(c => c.Cliente).Include(c => c.Vehiculo).Include(c => c.Empleado)
            .FirstOrDefaultAsync(c => c.Id == id);
        return cita == null ? null : _mapper.Map<CitaDto>(cita);
    }

    public async Task<IEnumerable<CitaDto>> GetByFechaAsync(string fecha)
    {
        if (!DateTime.TryParse(fecha, out var fechaParsed))
            return Enumerable.Empty<CitaDto>();

        var inicio = fechaParsed.Date;
        var fin = inicio.AddDays(1);
        var citas = await _context.Citas
            .Include(c => c.Cliente).Include(c => c.Vehiculo).Include(c => c.Empleado)
            .Where(c => c.FechaHora >= inicio && c.FechaHora < fin)
            .OrderByDescending(c => c.Id).ToListAsync();
        return _mapper.Map<IEnumerable<CitaDto>>(citas);
    }

    public async Task<CitaDto> CreateAsync(CreateCitaDto dto)
    {
        await ValidateNoOverlapAsync(dto.EmpleadoId, dto.VehiculoId, dto.FechaHora, dto.DuracionMinutos);

        var cita = _mapper.Map<Cita>(dto);
        cita.Estatus = EstatusCita.Programada;
        await _repository.AddAsync(cita);

        var saved = await _context.Citas
            .Include(c => c.Cliente).Include(c => c.Vehiculo).Include(c => c.Empleado)
            .FirstOrDefaultAsync(c => c.Id == cita.Id);
        return _mapper.Map<CitaDto>(saved);
    }

    public async Task<CitaDto> UpdateAsync(int id, UpdateCitaDto dto)
    {
        var cita = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Cita {id} no encontrada");

        if (dto.EmpleadoId.HasValue) cita.EmpleadoId = dto.EmpleadoId;
        if (dto.FechaHora.HasValue) cita.FechaHora = dto.FechaHora.Value;
        if (dto.DuracionMinutos.HasValue) cita.DuracionMinutos = dto.DuracionMinutos.Value;
        if (dto.Estatus.HasValue) cita.Estatus = dto.Estatus.Value;
        if (dto.Motivo != null) cita.Motivo = dto.Motivo;
        if (dto.Observaciones != null) cita.Observaciones = dto.Observaciones;

        var empleadoId = dto.EmpleadoId ?? cita.EmpleadoId;
        var vehiculoId = cita.VehiculoId;
        var fechaHora = dto.FechaHora ?? cita.FechaHora;
        var duracion = dto.DuracionMinutos ?? cita.DuracionMinutos;
        await ValidateNoOverlapAsync(empleadoId, vehiculoId, fechaHora, duracion, id);

        await _repository.UpdateAsync(cita);
        return _mapper.Map<CitaDto>(cita);
    }

    private async Task ValidateNoOverlapAsync(int? empleadoId, int vehiculoId, DateTime fechaHora, int duracionMinutos, int? excludeCitaId = null)
    {
        var nuevaInicio = fechaHora;
        var nuevaFin = fechaHora.AddMinutes(duracionMinutos);

        var query = _context.Citas
            .Where(c => c.Estatus != EstatusCita.Cancelada);

        if (excludeCitaId.HasValue)
            query = query.Where(c => c.Id != excludeCitaId.Value);

        var existentes = await query.ToListAsync();

        foreach (var c in existentes)
        {
            var existenteInicio = c.FechaHora;
            var existenteFin = c.FechaHora.AddMinutes(c.DuracionMinutos);

            var seEmpalma = nuevaInicio < existenteFin && nuevaFin > existenteInicio;
            if (!seEmpalma) continue;

            if (empleadoId.HasValue && c.EmpleadoId == empleadoId.Value)
                throw new InvalidOperationException($"El empleado ya tiene una cita programada de {existenteInicio:HH:mm} a {existenteFin:HH:mm} el {existenteInicio:dd/MM/yyyy}");

            if (c.VehiculoId == vehiculoId)
                throw new InvalidOperationException($"El vehiculo ya tiene una cita programada de {existenteInicio:HH:mm} a {existenteFin:HH:mm} el {existenteInicio:dd/MM/yyyy}");
        }
    }

    public async Task DeleteAsync(int id)
    {
        var cita = await _repository.GetByIdAsync(id)
            ?? throw new KeyNotFoundException($"Cita {id} no encontrada");

        await _repository.DeleteAsync(cita);
    }

    public async Task<CitaDto> ConvertirAOrdenAsync(int citaId)
    {
        var cita = await _context.Citas
            .Include(c => c.Cliente).Include(c => c.Vehiculo).Include(c => c.Empleado)
            .FirstOrDefaultAsync(c => c.Id == citaId)
            ?? throw new KeyNotFoundException($"Cita {citaId} no encontrada");

        if (cita.OrdenTrabajoId.HasValue)
            throw new InvalidOperationException("Esta cita ya tiene una orden de trabajo asociada");

        var year = DateTime.Now.Year;
        var count = await _context.OrdenesTrabajo.CountAsync(o => o.FechaEntrada.Year == year);

        var orden = new OrdenTrabajo
        {
            Folio = $"OT-{year}-{(count + 1):D4}",
            VehiculoId = cita.VehiculoId,
            ClienteId = cita.ClienteId,
            EmpleadoRecibeId = cita.EmpleadoId ?? throw new InvalidOperationException("La cita debe tener un empleado asignado"),
            EmpleadoAsignadoId = cita.EmpleadoId,
            Estatus = EstatusOrden.Recibida,
            FechaEntrada = DateTime.Now,
            Diagnostico = cita.Motivo
        };

        _context.OrdenesTrabajo.Add(orden);
        await _context.SaveChangesAsync();

        cita.OrdenTrabajoId = orden.Id;
        cita.Estatus = EstatusCita.Completada;

        await _repository.UpdateAsync(cita);

        var updated = await _context.Citas
            .Include(c => c.Cliente).Include(c => c.Vehiculo).Include(c => c.Empleado)
            .FirstOrDefaultAsync(c => c.Id == cita.Id);
        return _mapper.Map<CitaDto>(updated);
    }
}
