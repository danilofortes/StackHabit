using StackHabit.Core.Entities;

namespace StackHabit.Core.Interfaces;

public interface IMonthlyMetaRepository
{
    Task<IEnumerable<MonthlyMeta>> GetByUserAndMonthAsync(Guid userId, string targetDate);
    Task<MonthlyMeta?> GetByIdAsync(int id);
    Task<MonthlyMeta> CreateAsync(MonthlyMeta meta);
    Task<MonthlyMeta> UpdateAsync(MonthlyMeta meta);
    Task DeleteAsync(int id);
}

