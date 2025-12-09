using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using StackHabit.Core.DTOs;
using StackHabit.Core.Interfaces;

namespace StackHabit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HabitsController : ControllerBase
{
    private readonly IHabitRepository _habitRepository;
    private readonly IDailyLogRepository _dailyLogRepository;

    public HabitsController(IHabitRepository habitRepository, IDailyLogRepository dailyLogRepository)
    {
        _habitRepository = habitRepository;
        _dailyLogRepository = dailyLogRepository;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HabitResponse>>> GetHabits([FromQuery] bool includeArchived = false)
    {
        var userId = GetUserId();
        var habits = await _habitRepository.GetByUserIdAsync(userId, includeArchived);
        var habitsDto = habits.Select(h => new HabitResponse
        {
            Id = h.Id,
            Title = h.Title,
            ColorHex = h.ColorHex,
            IsArchived = h.IsArchived,
            CreatedAt = h.CreatedAt
        });
        return Ok(habitsDto);
    }

    [HttpPost]
    public async Task<ActionResult<HabitResponse>> CreateHabit([FromBody] CreateHabitRequest request)
    {
        var userId = GetUserId();
        var habit = new Core.Entities.Habit
        {
            UserId = userId,
            Title = request.Title,
            ColorHex = request.ColorHex ?? "#3B82F6"
        };

        var created = await _habitRepository.CreateAsync(habit);
        var habitDto = new HabitResponse
        {
            Id = created.Id,
            Title = created.Title,
            ColorHex = created.ColorHex,
            IsArchived = created.IsArchived,
            CreatedAt = created.CreatedAt
        };
        return CreatedAtAction(nameof(GetHabits), new { id = created.Id }, habitDto);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<HabitResponse>> UpdateHabit(int id, [FromBody] UpdateHabitRequest request)
    {
        var habit = await _habitRepository.GetByIdAsync(id);
        if (habit == null || habit.UserId != GetUserId())
        {
            return NotFound();
        }

        habit.Title = request.Title;
        habit.ColorHex = request.ColorHex ?? "#3B82F6";
        habit.IsArchived = request.IsArchived;

        var updated = await _habitRepository.UpdateAsync(habit);
        var habitDto = new HabitResponse
        {
            Id = updated.Id,
            Title = updated.Title,
            ColorHex = updated.ColorHex,
            IsArchived = updated.IsArchived,
            CreatedAt = updated.CreatedAt
        };
        return Ok(habitDto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHabit(int id)
    {
        try
        {
            var habit = await _habitRepository.GetByIdAsync(id);
            if (habit == null)
            {
                return NotFound(new { message = "Hábito não encontrado." });
            }

            var userId = GetUserId();
            if (habit.UserId != userId)
            {
                return StatusCode(403, new { message = "Você não tem permissão para excluir este hábito." });
            }

            await _habitRepository.DeleteAsync(id);
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao excluir hábito: {ex.Message}" });
        }
    }

    [HttpPatch("{id}/toggle")]
    public async Task<ActionResult<DailyLogResponse>> ToggleHabit(int id, [FromBody] ToggleHabitRequest request)
    {
        var habit = await _habitRepository.GetByIdAsync(id);
        if (habit == null || habit.UserId != GetUserId())
        {
            return NotFound();
        }

        if (!DateOnly.TryParse(request.Date, out var date))
        {
            return BadRequest(new { message = "Data inválida. Use formato YYYY-MM-DD" });
        }

        var log = new Core.Entities.DailyLog
        {
            HabitId = id,
            Date = date
        };

        var result = await _dailyLogRepository.CreateOrUpdateAsync(log);
        
        // Se o log foi removido (toggle off), retorna null ou um objeto indicando remoção
        if (!result.IsCompleted && result.Id == 0)
        {
            return Ok(new DailyLogResponse
            {
                HabitId = id,
                Date = request.Date,
                IsCompleted = false
            });
        }

        var logDto = new DailyLogResponse
        {
            Id = result.Id,
            HabitId = result.HabitId,
            Date = result.Date.ToString("yyyy-MM-dd"),
            IsCompleted = result.IsCompleted
        };
        return Ok(logDto);
    }
}

