using Microsoft.EntityFrameworkCore;
using StackHabit.Core.Entities;
using StackHabit.Core.Interfaces;
using StackHabit.Infrastructure.Data;

namespace StackHabit.Infrastructure.Repositories;

public class HabitRepository : IHabitRepository
{
    private readonly ApplicationDbContext _context;

    public HabitRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Habit>> GetByUserIdAsync(Guid userId, bool includeArchived = false)
    {
        var query = _context.Habits
            .Where(h => h.UserId == userId);

        if (!includeArchived)
        {
            query = query.Where(h => !h.IsArchived);
        }

        return await query
            .OrderBy(h => h.CreatedAt)
            .ToListAsync();
    }

    public async Task<Habit?> GetByIdAsync(int id)
    {
        return await _context.Habits
            .Include(h => h.User)
            .FirstOrDefaultAsync(h => h.Id == id);
    }

    public async Task<Habit> CreateAsync(Habit habit)
    {
        _context.Habits.Add(habit);
        await _context.SaveChangesAsync();
        return habit;
    }

    public async Task<Habit> UpdateAsync(Habit habit)
    {
        _context.Habits.Update(habit);
        await _context.SaveChangesAsync();
        return habit;
    }

    public async Task DeleteAsync(int id)
    {
        var habit = await _context.Habits.FindAsync(id);
        if (habit != null)
        {
            _context.Habits.Remove(habit);
            await _context.SaveChangesAsync();
        }
    }
}

