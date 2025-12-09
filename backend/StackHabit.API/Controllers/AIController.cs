using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using StackHabit.Core.DTOs;
using StackHabit.Core.Interfaces;

namespace StackHabit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AIController : ControllerBase
{
    private readonly IAIService _aiService;
    private readonly IConfiguration _configuration;

    public AIController(IAIService aiService, IConfiguration configuration)
    {
        _aiService = aiService;
        _configuration = configuration;
    }

    [HttpPost("review-guidance")]
    public async Task<ActionResult<ReviewGuidanceResponse>> GetReviewGuidance([FromBody] ReviewGuidanceRequest request)
    {
        try
        {
            var guidance = await _aiService.GetReviewGuidanceAsync(
                request.Month,
                request.Habits,
                request.MonthlyMetas,
                request.UnmetGoals);
            return Ok(guidance);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao obter guia: {ex.Message}" });
        }
    }

    [HttpPost("improve-review")]
    public async Task<ActionResult<string>> ImproveReview([FromBody] ImproveReviewRequest request)
    {
        try
        {
            var improvedText = await _aiService.ImproveReviewTextAsync(
                request.CurrentText,
                request.Month,
                request.Habits,
                request.MonthlyMetas);
            
            // Verificar se a IA foi realmente usada ou se foi apenas fallback
            var isAIAvailable = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("OPENAI_API_KEY"))
                || !string.IsNullOrEmpty(_configuration["OpenAI:ApiKey"]);
            
            return Ok(new { improvedText, aiAvailable = isAIAvailable });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao melhorar texto: {ex.Message}" });
        }
    }
}

