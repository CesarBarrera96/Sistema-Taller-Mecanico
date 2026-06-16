using FluentValidation;
using TallerMecanico.Application.DTOs.Ordenes;

namespace TallerMecanico.Application.Validators;

public class CreateOrdenTrabajoValidator : AbstractValidator<CreateOrdenTrabajoDto>
{
    public CreateOrdenTrabajoValidator()
    {
        RuleFor(x => x.VehiculoId).GreaterThan(0);
        RuleFor(x => x.ClienteId).GreaterThan(0);
        RuleFor(x => x.EmpleadoRecibeId).GreaterThan(0);
        RuleFor(x => x.Detalles).NotEmpty().WithMessage("La orden debe tener al menos un detalle");
        RuleForEach(x => x.Detalles).ChildRules(detalle =>
        {
            detalle.RuleFor(d => d.Tipo).NotEmpty().Must(t => t == "Servicio" || t == "Refaccion")
                .WithMessage("El tipo debe ser 'Servicio' o 'Refaccion'");
            detalle.RuleFor(d => d.Cantidad).GreaterThan(0);
        });
    }
}
