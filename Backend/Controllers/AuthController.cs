using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Lollita.Api.Data;
using Lollita.Api.Dtos;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Lollita.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(AppDbContext db, IConfiguration config) : ControllerBase
{
    private const string CookieName = "lollita_admin_token";

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        var email = request.Email.Trim().ToLowerInvariant();

        var admin = await db.Admins
            .FirstOrDefaultAsync(a => a.Email.ToLower() == email && a.IsActive, cancellationToken);

        if (admin is null || !BCrypt.Net.BCrypt.Verify(request.Password, admin.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        admin.LastLoginAt = DateTime.UtcNow;
        await db.SaveChangesAsync(cancellationToken);

        var token = CreateJwt(admin);
        var expires = DateTimeOffset.UtcNow.AddHours(8);

        Response.Cookies.Append(CookieName, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = false, // set true in production with HTTPS
            SameSite = SameSiteMode.Lax,
            Expires = expires,
            Path = "/"
        });

        return Ok(new
        {
            message = "Login successful",
            fullName = admin.FullName,
            email = admin.Email,
            role = admin.Role
        });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me()
    {
        return Ok(new
        {
            id = User.FindFirstValue(ClaimTypes.NameIdentifier),
            email = User.FindFirstValue(ClaimTypes.Email),
            fullName = User.FindFirstValue(ClaimTypes.Name),
            role = User.FindFirstValue(ClaimTypes.Role)
        });
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        Response.Cookies.Delete(CookieName, new CookieOptions
        {
            Path = "/",
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax
        });

        return Ok(new { message = "Logged out." });
    }

    /// <summary>
    /// Create a new admin account and save it to the database.
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            return BadRequest(new { message = "Email and password are required." });
        }

        if (request.Password.Length < 6)
        {
            return BadRequest(new { message = "Password must be at least 6 characters." });
        }

        var email = request.Email.Trim().ToLowerInvariant();
        var exists = await db.Admins.AnyAsync(a => a.Email.ToLower() == email, cancellationToken);
        if (exists)
        {
            return Conflict(new { message = "An account with this email already exists." });
        }

        var fullName = string.IsNullOrWhiteSpace(request.FullName)
            ? "K & Z Admin"
            : request.FullName.Trim();

        db.Admins.Add(new Models.Admin
        {
            FullName = fullName,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = "Admin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        });

        await db.SaveChangesAsync(cancellationToken);

        return Ok(new { message = "Account created successfully. You can sign in now." });
    }

    /// <summary>
    /// Dev helper: create first admin. Prefer /api/auth/register.
    /// </summary>
    [HttpPost("seed")]
    public async Task<IActionResult> Seed([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        return await Register(new RegisterRequest
        {
            Email = request.Email,
            Password = request.Password,
            FullName = "K & Z Admin"
        }, cancellationToken);
    }

    private string CreateJwt(Models.Admin admin)
    {
        var key = config["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key is missing.");
        var issuer = config["Jwt:Issuer"] ?? "Lollita.Api";
        var audience = config["Jwt:Audience"] ?? "Lollita.Admin";

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, admin.Id.ToString()),
            new(ClaimTypes.Email, admin.Email),
            new(ClaimTypes.Name, admin.FullName),
            new(ClaimTypes.Role, admin.Role)
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}