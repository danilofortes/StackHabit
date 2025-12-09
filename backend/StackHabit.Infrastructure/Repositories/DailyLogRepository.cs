using Microsoft.EntityFrameworkCore;
using StackHabit.Core.Entities;
using StackHabit.Core.Interfaces;
using StackHabit.Infrastructure.Data;

namespace StackHabit.Infrastructure.Repositories;

public class DailyLogRepository : IDailyLogRepository
{
    private readonly ApplicationDbContext _context;

    public DailyLogRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<DailyLog?> GetByHabitAndDateAsync(int habitId, DateOnly date)
    {
        return await _context.DailyLogs
            .FirstOrDefaultAsync(l => l.HabitId == habitId && l.Date == date);
    }

    public async Task<IEnumerable<DailyLog>> GetByUserAndMonthAsync(Guid userId, int year, int month)
    {
        return await _context.DailyLogs
            .Include(l => l.Habit)
            .Where(l => l.Habit.UserId == userId 
                && l.Date.Year == year 
                && l.Date.Month == month)
            .ToListAsync();
    }

    public async Task<DailyLog> CreateOrUpdateAsync(DailyLog log)
    {
        var existing = await GetByHabitAndDateAsync(log.HabitId, log.Date);
        
        if (existing != null)
        {
            // Toggle: se existe e está completo, remove; se existe e não está completo, marca como completo
            existing.IsCompleted = !existing.IsCompleted;
            existing.LoggedAt = DateTime.UtcNow;
            
            if (!existing.IsCompleted)
            {
                // Se desmarcou, remove o log
                _context.DailyLogs.Remove(existing);
                await _context.SaveChangesAsync();
                return existing; // Retorna o objeto removido (será ignorado no frontend)
            }
            
            _context.DailyLogs.Update(existing);
            await _context.SaveChangesAsync();
            return existing;
        }
        else
        {
            // Cria novo log como completo
            log.IsCompleted = true;
            _context.DailyLogs.Add(log);
            await _context.SaveChangesAsync();
            return log;
        }
    }

    public async Task DeleteAsync(long id)
    {
        var log = await _context.DailyLogs.FindAsync(id);
        if (log != null)
        {
            _context.DailyLogs.Remove(log);
            await _context.SaveChangesAsync();
        }
    }
}

