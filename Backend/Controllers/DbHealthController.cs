using Lollita.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lollita.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DbHealthController(AppDbContext db) : ControllerBase
{
    private const int MaxAttempts = 3;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        Exception? lastError = null;

        for (var attempt = 1; attempt <= MaxAttempts; attempt++)
        {
            try
            {
                // Drop any stale pooled connection Neon may have closed after suspend.
                await db.Database.CloseConnectionAsync();

                await using var connection = db.Database.GetDbConnection();
                if (connection.State != System.Data.ConnectionState.Open)
                {
                    await connection.OpenAsync(cancellationToken);
                }

                await using var command = connection.CreateCommand();
                command.CommandText = "SELECT current_database(), NOW() AT TIME ZONE 'UTC'";

                await using var reader = await command.ExecuteReaderAsync(cancellationToken);

                string? database = null;
                DateTime? serverTimeUtc = null;

                if (await reader.ReadAsync(cancellationToken))
                {
                    database = reader.GetString(0);
                    serverTimeUtc = reader.GetFieldValue<DateTime>(1);
                }

                return Ok(new
                {
                    connected = true,
                    database,
                    serverTimeUtc,
                    attempt
                });
            }
            catch (Exception ex) when (attempt < MaxAttempts)
            {
                lastError = ex;
                // Neon cold start / dropped pooler connection — wait and retry.
                await Task.Delay(TimeSpan.FromSeconds(attempt), cancellationToken);
            }
            catch (Exception ex)
            {
                lastError = ex;
            }
        }

        return StatusCode(StatusCodes.Status503ServiceUnavailable, new
        {
            connected = false,
            error = lastError?.Message,
            detail = lastError?.InnerException?.Message
        });
    }
}
