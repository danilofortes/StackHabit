using Microsoft.EntityFrameworkCore;
using StackHabit.Core.Entities;
using StackHabit.Core.Interfaces;
using StackHabit.Infrastructure.Data;

namespace StackHabit.Infrastructure.Repositories;

public class MonthlyReviewRepository : IMonthlyReviewRepository
{
    private readonly ApplicationDbContext _context;

    public MonthlyReviewRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<MonthlyReview?> GetByUserAndMonthAsync(Guid userId, string targetDate)
    {
        return await _context.MonthlyReviews
            .FirstOrDefaultAsync(r => r.UserId == userId && r.TargetDate == targetDate);
    }

    public async Task<IEnumerable<MonthlyReview>> GetAllByUserAsync(Guid userId)
    {
        return await _context.MonthlyReviews
            .Where(r => r.UserId == userId)
            .OrderByDescending(r => r.TargetDate)
            .ToListAsync();
    }

    public async Task<MonthlyReview?> GetByIdAsync(int id)
    {
        return await _context.MonthlyReviews.FindAsync(id);
    }

    public async Task<MonthlyReview> CreateAsync(MonthlyReview review)
    {
        _context.MonthlyReviews.Add(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task<MonthlyReview> UpdateAsync(MonthlyReview review)
    {
        review.UpdatedAt = DateTime.UtcNow;
        _context.MonthlyReviews.Update(review);
        await _context.SaveChangesAsync();
        return review;
    }

    public async Task DeleteAsync(int id)
    {
        var review = await _context.MonthlyReviews.FindAsync(id);
        if (review != null)
        {
            _context.MonthlyReviews.Remove(review);
            await _context.SaveChangesAsync();
        }
    }
}

