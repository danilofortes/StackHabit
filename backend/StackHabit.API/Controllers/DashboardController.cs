using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using StackHabit.Core.DTOs;
using StackHabit.Core.Interfaces;

namespace StackHabit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IHabitRepository _habitRepository;
    private readonly IDailyLogRepository _dailyLogRepository;
    private readonly IMonthlyMetaRepository _monthlyMetaRepository;

    public DashboardController(
        IHabitRepository habitRepository,
        IDailyLogRepository dailyLogRepository,
        IMonthlyMetaRepository monthlyMetaRepository)
    {
        _habitRepository = habitRepository;
        _dailyLogRepository = dailyLogRepository;
        _monthlyMetaRepository = monthlyMetaRepository;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    }

    [HttpGet]
    public async Task<ActionResult<DashboardResponse>> GetDashboard([FromQuery] string month)
    {
        // month format: "YYYY-MM"
        if (string.IsNullOrEmpty(month) || !month.Contains('-'))
        {
            month = $"{DateTime.Now.Year}-{DateTime.Now.Month:D2}";
        }

        var parts = month.Split('-');
        if (parts.Length != 2 || !int.TryParse(parts[0], out int year) || !int.TryParse(parts[1], out int monthNum))
        {
            return BadRequest(new { message = "Formato de mês inválido. Use YYYY-MM" });
        }

        var userId = GetUserId();
        var habits = await _habitRepository.GetByUserIdAsync(userId, includeArchived: false);
        var logs = await _dailyLogRepository.GetByUserAndMonthAsync(userId, year, monthNum);
        var metas = await _monthlyMetaRepository.GetByUserAndMonthAsync(userId, month);

        var habitsDto = habits.Select(h => new HabitResponse
        {
            Id = h.Id,
            Title = h.Title,
            ColorHex = h.ColorHex,
            IsArchived = h.IsArchived,
            CreatedAt = h.CreatedAt
        }).ToList();

        var logsDict = new Dictionary<string, bool>();
        foreach (var log in logs.Where(l => l.IsCompleted))
        {
            var key = $"{log.HabitId}-{log.Date:yyyy-MM-dd}";
            logsDict[key] = true;
        }

        var metasDto = metas.Select(m => new MonthlyMetaResponse
        {
            Id = m.Id,
            TargetDate = m.TargetDate,
            Description = m.Description,
            IsDone = m.IsDone
        }).ToList();

        var response = new DashboardResponse
        {
            Month = month,
            Habits = habitsDto,
            Logs = logsDict,
            MonthlyMetas = metasDto
        };

        return Ok(response);
    }
}

