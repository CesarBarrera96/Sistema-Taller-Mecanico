using FluentValidation;
using TallerMecanico.Application.DTOs.Clientes;

namespace TallerMecanico.Application.Validators;

public class CreateClienteValidator : AbstractValidator<CreateClienteDto>
{
    public CreateClienteValidator()
    {
        RuleFor(x => x.Nombre).NotEmpty().MaximumLength(100);
        RuleFor(x => x.ApellidoPaterno).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Telefono).NotEmpty().MaximumLength(20);
        RuleFor(x => x.Email).Matches(@"^[^@\s]+@[^@\s]+\.[^@\s]+$")
            .When(x => !string.IsNullOrWhiteSpace(x.Email))
            .WithMessage("Formato de email inválido");
        RuleFor(x => x.RFC).MaximumLength(13)
            .When(x => !string.IsNullOrWhiteSpace(x.RFC));
    }
}
