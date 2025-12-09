using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using StackHabit.Core.DTOs;
using StackHabit.Core.Interfaces;

namespace StackHabit.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IUserRepository userRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        if (await _userRepository.EmailExistsAsync(request.Email))
        {
            throw new Exception("Email já está em uso.");
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        var user = new Core.Entities.User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            Name = request.Name
        };

        var createdUser = await _userRepository.CreateAsync(user);
        var userResponse = new UserResponse
        {
            Id = createdUser.Id,
            Email = createdUser.Email,
            Name = createdUser.Name
        };

        var token = GenerateJwtToken(userResponse);

        return new AuthResponse
        {
            Token = token,
            User = userResponse
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new Exception("Email ou senha inválidos.");
        }

        var userResponse = new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            Name = user.Name
        };

        var token = GenerateJwtToken(userResponse);

        return new AuthResponse
        {
            Token = token,
            User = userResponse
        };
    }

    public string GenerateJwtToken(UserResponse user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? throw new Exception("JWT Key não configurada.");
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "StackHabit";
        var jwtExpiryMinutes = int.Parse(_configuration["Jwt:ExpiryMinutes"] ?? "1440"); // 24 horas

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name)
        };

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtIssuer,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(jwtExpiryMinutes),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}

