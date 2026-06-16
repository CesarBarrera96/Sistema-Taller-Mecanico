using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TallerMecanico.Application.DTOs.Auth;
using TallerMecanico.Application.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace TallerMecanico.Application.Services;

public class AuthService : IAuthService
{
    private readonly IApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(IApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
    {
        var usuario = await _context.Usuarios
            .Include(u => u.Empleado)
            .FirstOrDefaultAsync(u => u.Username == loginDto.Username && u.Activo);

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, usuario.PasswordHash))
            throw new UnauthorizedAccessException("Credenciales inválidas");

        var token = GenerateToken(usuario);

        return new AuthResponseDto
        {
            Token = token,
            Username = usuario.Username,
            Rol = usuario.Rol.ToString(),
            EmpleadoId = usuario.Empleado?.Id
        };
    }

    private string GenerateToken(Domain.Entities.Usuario usuario)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.Name, usuario.Username),
            new Claim(ClaimTypes.Role, usuario.Rol.ToString()),
            new Claim("UsuarioId", usuario.Id.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(8),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
