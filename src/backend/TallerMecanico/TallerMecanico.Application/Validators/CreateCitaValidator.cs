using FluentValidation;
using TallerMecanico.Application.DTOs.Citas;

namespace TallerMecanico.Application.Validators;

public class CreateCitaValidator : AbstractValidator<CreateCitaDto>
{
    public CreateCitaValidator()
    {
        RuleFor(x => x.ClienteId).GreaterThan(0);
        RuleFor(x => x.VehiculoId).GreaterThan(0);
        RuleFor(x => x.FechaHora).Must(fecha => fecha > DateTime.Now).WithMessage("La fecha debe ser futura");
        RuleFor(x => x.DuracionMinutos).GreaterThan(0);
        RuleFor(x => x.Motivo).NotEmpty().MaximumLength(500);
    }
}
