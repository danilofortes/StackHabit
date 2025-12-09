using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using StackHabit.Core.DTOs;
using StackHabit.Core.Interfaces;

namespace StackHabit.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MonthlyReviewsController : ControllerBase
{
    private readonly IMonthlyReviewRepository _reviewRepository;

    public MonthlyReviewsController(IMonthlyReviewRepository reviewRepository)
    {
        _reviewRepository = reviewRepository;
    }

    private Guid GetUserId()
    {
        return Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MonthlyReviewResponse>>> GetAllMonthlyReviews()
    {
        var userId = GetUserId();
        var reviews = await _reviewRepository.GetAllByUserAsync(userId);
        var reviewsDto = reviews.Select(r => new MonthlyReviewResponse
        {
            Id = r.Id,
            TargetDate = r.TargetDate,
            Content = r.Content,
            CreatedAt = r.CreatedAt,
            UpdatedAt = r.UpdatedAt
        });
        return Ok(reviewsDto);
    }

    [HttpGet("{targetDate}")]
    public async Task<ActionResult<MonthlyReviewResponse>> GetMonthlyReview(string targetDate)
    {
        var userId = GetUserId();
        var review = await _reviewRepository.GetByUserAndMonthAsync(userId, targetDate);
        
        if (review == null)
        {
            return NotFound();
        }

        var reviewDto = new MonthlyReviewResponse
        {
            Id = review.Id,
            TargetDate = review.TargetDate,
            Content = review.Content,
            CreatedAt = review.CreatedAt,
            UpdatedAt = review.UpdatedAt
        };
        return Ok(reviewDto);
    }

    [HttpPost]
    public async Task<ActionResult<MonthlyReviewResponse>> CreateMonthlyReview([FromBody] CreateMonthlyReviewRequest request)
    {
        var userId = GetUserId();
        
        // Verificar se já existe uma review para este mês
        var existing = await _reviewRepository.GetByUserAndMonthAsync(userId, request.TargetDate);
        if (existing != null)
        {
            return Conflict(new { message = "Já existe uma review para este mês. Use PUT para atualizar." });
        }

        var review = new Core.Entities.MonthlyReview
        {
            UserId = userId,
            TargetDate = request.TargetDate,
            Content = request.Content
        };

        var created = await _reviewRepository.CreateAsync(review);
        var reviewDto = new MonthlyReviewResponse
        {
            Id = created.Id,
            TargetDate = created.TargetDate,
            Content = created.Content,
            CreatedAt = created.CreatedAt,
            UpdatedAt = created.UpdatedAt
        };
        return CreatedAtAction(nameof(GetMonthlyReview), new { targetDate = request.TargetDate }, reviewDto);
    }

    [HttpPut("{targetDate}")]
    public async Task<ActionResult<MonthlyReviewResponse>> UpdateMonthlyReview(string targetDate, [FromBody] UpdateMonthlyReviewRequest request)
    {
        var userId = GetUserId();
        var review = await _reviewRepository.GetByUserAndMonthAsync(userId, targetDate);
        
        if (review == null)
        {
            return NotFound();
        }

        review.Content = request.Content;
        var updated = await _reviewRepository.UpdateAsync(review);
        
        var reviewDto = new MonthlyReviewResponse
        {
            Id = updated.Id,
            TargetDate = updated.TargetDate,
            Content = updated.Content,
            CreatedAt = updated.CreatedAt,
            UpdatedAt = updated.UpdatedAt
        };
        return Ok(reviewDto);
    }

    [HttpDelete("{targetDate}")]
    public async Task<IActionResult> DeleteMonthlyReview(string targetDate)
    {
        var userId = GetUserId();
        var review = await _reviewRepository.GetByUserAndMonthAsync(userId, targetDate);
        
        if (review == null)
        {
            return NotFound();
        }

        await _reviewRepository.DeleteAsync(review.Id);
        return NoContent();
    }
}

