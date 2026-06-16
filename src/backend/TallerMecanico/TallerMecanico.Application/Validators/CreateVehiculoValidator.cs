using FluentValidation;
using TallerMecanico.Application.DTOs.Vehiculos;

namespace TallerMecanico.Application.Validators;

public class CreateVehiculoValidator : AbstractValidator<CreateVehiculoDto>
{
    public CreateVehiculoValidator()
    {
        RuleFor(x => x.ClienteId).GreaterThan(0);
        RuleFor(x => x.Marca).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Modelo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Anio).InclusiveBetween(1900, DateTime.Now.Year + 1);
        RuleFor(x => x.Placas).NotEmpty().MaximumLength(10);
        RuleFor(x => x.VIN).MaximumLength(17).When(x => !string.IsNullOrEmpty(x.VIN));
    }
}
