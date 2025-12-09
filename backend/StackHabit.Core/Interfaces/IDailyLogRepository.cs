using StackHabit.Core.Entities;

namespace StackHabit.Core.Interfaces;

public interface IDailyLogRepository
{
    Task<DailyLog?> GetByHabitAndDateAsync(int habitId, DateOnly date);
    Task<IEnumerable<DailyLog>> GetByUserAndMonthAsync(Guid userId, int year, int month);
    Task<DailyLog> CreateOrUpdateAsync(DailyLog log);
    Task DeleteAsync(long id);
}

