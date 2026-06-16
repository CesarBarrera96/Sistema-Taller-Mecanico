using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace TallerMecanico.API.Filters;

public class ValidationFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        if (context.ModelState.IsValid) return;

        var errors = context.ModelState
            .Where(e => e.Value?.Errors.Count > 0)
            .Select(e => new
            {
                Campo = e.Key,
                Errores = e.Value!.Errors.Select(x => x.ErrorMessage).ToArray()
            });

        context.Result = new BadRequestObjectResult(new
        {
            mensaje = "Errores de validación",
            errores = errors
        });
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}
