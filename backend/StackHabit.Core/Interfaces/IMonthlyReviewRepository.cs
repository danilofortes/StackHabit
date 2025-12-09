using StackHabit.Core.Entities;

namespace StackHabit.Core.Interfaces;

public interface IMonthlyReviewRepository
{
    Task<MonthlyReview?> GetByUserAndMonthAsync(Guid userId, string targetDate);
    Task<IEnumerable<MonthlyReview>> GetAllByUserAsync(Guid userId);
    Task<MonthlyReview?> GetByIdAsync(int id);
    Task<MonthlyReview> CreateAsync(MonthlyReview review);
    Task<MonthlyReview> UpdateAsync(MonthlyReview review);
    Task DeleteAsync(int id);
}

