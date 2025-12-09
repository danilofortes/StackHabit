using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using StackHabit.Core.DTOs;
using StackHabit.Core.Interfaces;

namespace StackHabit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MonthlyMetasController : ControllerBase
{
    private readonly IMonthlyMetaRepository _metaRepository;

    public MonthlyMetasController(IMonthlyMetaRepository metaRepository)
    {
        _metaRepository = metaRepository;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    }

    [HttpGet("{targetDate}")]
    public async Task<ActionResult<IEnumerable<MonthlyMetaResponse>>> GetMonthlyMetas(string targetDate)
    {
        var userId = GetUserId();
        var metas = await _metaRepository.GetByUserAndMonthAsync(userId, targetDate);
        var metasDto = metas.Select(m => new MonthlyMetaResponse
        {
            Id = m.Id,
            TargetDate = m.TargetDate,
            Description = m.Description,
            IsDone = m.IsDone
        });
        return Ok(metasDto);
    }

    [HttpPost]
    public async Task<ActionResult<MonthlyMetaResponse>> CreateMonthlyMeta([FromBody] CreateMonthlyMetaRequest request)
    {
        var userId = GetUserId();
        var meta = new Core.Entities.MonthlyMeta
        {
            UserId = userId,
            TargetDate = request.TargetDate,
            Description = request.Description
        };

        var created = await _metaRepository.CreateAsync(meta);
        var metaDto = new MonthlyMetaResponse
        {
            Id = created.Id,
            TargetDate = created.TargetDate,
            Description = created.Description,
            IsDone = created.IsDone
        };
        return Ok(metaDto);
    }

    [HttpPatch("{id}/toggle")]
    public async Task<ActionResult<MonthlyMetaResponse>> ToggleMeta(int id)
    {
        var meta = await _metaRepository.GetByIdAsync(id);
        if (meta == null || meta.UserId != GetUserId())
        {
            return NotFound();
        }

        meta.IsDone = !meta.IsDone;
        var updated = await _metaRepository.UpdateAsync(meta);
        var metaDto = new MonthlyMetaResponse
        {
            Id = updated.Id,
            TargetDate = updated.TargetDate,
            Description = updated.Description,
            IsDone = updated.IsDone
        };
        return Ok(metaDto);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMeta(int id)
    {
        var meta = await _metaRepository.GetByIdAsync(id);
        if (meta == null || meta.UserId != GetUserId())
        {
            return NotFound();
        }

        await _metaRepository.DeleteAsync(id);
        return NoContent();
    }
}

