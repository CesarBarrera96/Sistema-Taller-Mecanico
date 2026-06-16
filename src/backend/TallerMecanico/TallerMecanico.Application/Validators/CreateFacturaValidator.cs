using FluentValidation;
using TallerMecanico.Application.DTOs.Facturas;

namespace TallerMecanico.Application.Validators;

public class CreateFacturaValidator : AbstractValidator<CreateFacturaDto>
{
    public CreateFacturaValidator()
    {
        RuleFor(x => x.OrdenTrabajoId).GreaterThan(0);
    }
}

public class PagarFacturaValidator : AbstractValidator<PagarFacturaDto>
{
    public PagarFacturaValidator()
    {
        RuleFor(x => x.MetodoPago).NotEmpty().MaximumLength(50);
    }
}

public class LoginDtoValidator : AbstractValidator<TallerMecanico.Application.DTOs.Auth.LoginDto>
{
    public LoginDtoValidator()
    {
        RuleFor(x => x.Username).NotEmpty();
        RuleFor(x => x.Password).NotEmpty();
    }
}
