using TallerMecanico.Application.DTOs.Auth;

namespace TallerMecanico.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
}
