namespace TallerMecanico.Application.DTOs.Vehiculos;

public class VehiculoDto
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public string NombreCliente { get; set; } = string.Empty;
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public int Anio { get; set; }
    public string? Color { get; set; }
    public string Placas { get; set; } = string.Empty;
    public string? VIN { get; set; }
    public int? Kilometraje { get; set; }
    public DateTime FechaCreacion { get; set; }
}

public class CreateVehiculoDto
{
    public int ClienteId { get; set; }
    public string Marca { get; set; } = string.Empty;
    public string Modelo { get; set; } = string.Empty;
    public int Anio { get; set; }
    public string? Color { get; set; }
    public string Placas { get; set; } = string.Empty;
    public string? VIN { get; set; }
    public int? Kilometraje { get; set; }
}

public class UpdateVehiculoDto : CreateVehiculoDto { }
