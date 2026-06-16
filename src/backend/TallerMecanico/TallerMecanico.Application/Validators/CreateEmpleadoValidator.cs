using FluentValidation;
using TallerMecanico.Application.DTOs.Empleados;

namespace TallerMecanico.Application.Validators;

public class CreateEmpleadoValidator : AbstractValidator<CreateEmpleadoDto>
{
    public CreateEmpleadoValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ApellidoPaterno).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Puesto).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Email).EmailAddress().When(x => !string.IsNullOrEmpty(x.Email));
        RuleFor(x => x.Telefono).MaximumLength(20).When(x => !string.IsNullOrEmpty(x.Telefono));
    }
}
