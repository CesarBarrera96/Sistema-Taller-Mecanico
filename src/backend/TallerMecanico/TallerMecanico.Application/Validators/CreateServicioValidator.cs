using FluentValidation;
using TallerMecanico.Application.DTOs.Servicios;

namespace TallerMecanico.Application.Validators;

public class CreateServicioValidator : AbstractValidator<CreateServicioDto>
{
    public CreateServicioValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PrecioManoObra).GreaterThan(0);
    }
}
