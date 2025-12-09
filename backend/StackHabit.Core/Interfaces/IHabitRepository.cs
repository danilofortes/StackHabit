using StackHabit.Core.Entities;

namespace StackHabit.Core.Interfaces;

public interface IHabitRepository
{
    Task<IEnumerable<Habit>> GetByUserIdAsync(Guid userId, bool includeArchived = false);
    Task<Habit?> GetByIdAsync(int id);
    Task<Habit> CreateAsync(Habit habit);
    Task<Habit> UpdateAsync(Habit habit);
    Task DeleteAsync(int id);
}

