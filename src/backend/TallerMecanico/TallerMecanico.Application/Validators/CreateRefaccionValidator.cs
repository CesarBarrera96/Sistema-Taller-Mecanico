using FluentValidation;
using TallerMecanico.Application.DTOs.Refacciones;

namespace TallerMecanico.Application.Validators;

public class CreateRefaccionValidator : AbstractValidator<CreateRefaccionDto>
{
    public CreateRefaccionValidator()
    {
        RuleFor(x => x.Codigo).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(100);
        RuleFor(x => x.PrecioCompra).GreaterThan(0);
        RuleFor(x => x.PrecioVenta).GreaterThan(0);
        RuleFor(x => x.StockActual).GreaterThanOrEqualTo(0);
        RuleFor(x => x.StockMinimo).GreaterThanOrEqualTo(0);
    }
}
