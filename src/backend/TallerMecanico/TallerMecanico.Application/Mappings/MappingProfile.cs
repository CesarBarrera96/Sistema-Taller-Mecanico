using AutoMapper;
using TallerMecanico.Application.DTOs.Clientes;
using TallerMecanico.Application.DTOs.Vehiculos;
using TallerMecanico.Application.DTOs.Ordenes;
using TallerMecanico.Application.DTOs.Servicios;
using TallerMecanico.Application.DTOs.Refacciones;
using TallerMecanico.Application.DTOs.Empleados;
using TallerMecanico.Application.DTOs.Citas;
using TallerMecanico.Application.DTOs.Facturas;
using TallerMecanico.Application.DTOs.Configuracion;
using TallerMecanico.Domain.Entities;

namespace TallerMecanico.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Cliente, ClienteDto>();
        CreateMap<CreateClienteDto, Cliente>();
        CreateMap<UpdateClienteDto, Cliente>().ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));

        CreateMap<Vehiculo, VehiculoDto>()
            .ForMember(d => d.NombreCliente, opt => opt.MapFrom(s => $"{s.Cliente.Nombre} {s.Cliente.ApellidoPaterno}"));
        CreateMap<CreateVehiculoDto, Vehiculo>();
        CreateMap<UpdateVehiculoDto, Vehiculo>().ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));

        CreateMap<OrdenTrabajo, OrdenTrabajoDto>()
            .ForMember(d => d.VehiculoDescripcion, opt => opt.MapFrom(s => $"{s.Vehiculo.Marca} {s.Vehiculo.Modelo} ({s.Vehiculo.Placas})"))
            .ForMember(d => d.NombreCliente, opt => opt.MapFrom(s => $"{s.Cliente.Nombre} {s.Cliente.ApellidoPaterno}"))
            .ForMember(d => d.NombreRecibe, opt => opt.MapFrom(s => $"{s.EmpleadoRecibe.Nombre} {s.EmpleadoRecibe.ApellidoPaterno}"))
            .ForMember(d => d.NombreAsignado, opt => opt.MapFrom(s => s.EmpleadoAsignado != null ? $"{s.EmpleadoAsignado.Nombre} {s.EmpleadoAsignado.ApellidoPaterno}" : null));

        CreateMap<OrdenDetalle, OrdenDetalleDto>()
            .ForMember(d => d.Tipo, opt => opt.MapFrom(s => s.Tipo.ToString()))
            .ForMember(d => d.NombreServicio, opt => opt.MapFrom(s => s.Servicio != null ? s.Servicio.Nombre : null))
            .ForMember(d => d.NombreRefaccion, opt => opt.MapFrom(s => s.Refaccion != null ? s.Refaccion.Nombre : null));

        CreateMap<Servicio, ServicioDto>();
        CreateMap<CreateServicioDto, Servicio>();
        CreateMap<UpdateServicioDto, Servicio>().ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));

        CreateMap<Refaccion, RefaccionDto>();
        CreateMap<CreateRefaccionDto, Refaccion>();
        CreateMap<UpdateRefaccionDto, Refaccion>().ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));

        CreateMap<Empleado, EmpleadoDto>();
        CreateMap<CreateEmpleadoDto, Empleado>();
        CreateMap<UpdateEmpleadoDto, Empleado>().ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));

        CreateMap<Cita, CitaDto>()
            .ForMember(d => d.NombreCliente, opt => opt.MapFrom(s => $"{s.Cliente.Nombre} {s.Cliente.ApellidoPaterno}"))
            .ForMember(d => d.VehiculoDescripcion, opt => opt.MapFrom(s => $"{s.Vehiculo.Marca} {s.Vehiculo.Modelo} ({s.Vehiculo.Placas})"))
            .ForMember(d => d.NombreEmpleado, opt => opt.MapFrom(s => s.Empleado != null ? $"{s.Empleado.Nombre} {s.Empleado.ApellidoPaterno}" : null));
        CreateMap<CreateCitaDto, Cita>();
        CreateMap<UpdateCitaDto, Cita>().ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));

        CreateMap<Factura, FacturaDto>()
            .ForMember(d => d.NombreCliente, opt => opt.MapFrom(s => $"{s.Cliente.Nombre} {s.Cliente.ApellidoPaterno}"))
            .ForMember(d => d.OrdenFolio, opt => opt.MapFrom(s => s.OrdenTrabajo.Folio));

        CreateMap<FacturaDetalle, FacturaDetalleDto>();
        CreateMap<CreateFacturaDto, Factura>();
        CreateMap<CreateOrdenTrabajoDto, OrdenTrabajo>();
        CreateMap<CreateOrdenDetalleDto, OrdenDetalle>();

        CreateMap<ConfiguracionTaller, ConfiguracionTallerDto>();
        CreateMap<UpdateConfiguracionTallerDto, ConfiguracionTaller>().ForAllMembers(opts => opts.Condition((_, _, srcMember) => srcMember != null));
    }
}
