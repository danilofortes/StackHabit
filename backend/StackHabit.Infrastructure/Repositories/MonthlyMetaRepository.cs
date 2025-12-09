using Microsoft.EntityFrameworkCore;
using StackHabit.Core.Entities;
using StackHabit.Core.Interfaces;
using StackHabit.Infrastructure.Data;

namespace StackHabit.Infrastructure.Repositories;

public class MonthlyMetaRepository : IMonthlyMetaRepository
{
    private readonly ApplicationDbContext _context;

    public MonthlyMetaRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<MonthlyMeta>> GetByUserAndMonthAsync(Guid userId, string targetDate)
    {
        return await _context.MonthlyMetas
            .Where(m => m.UserId == userId && m.TargetDate == targetDate)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync();
    }

    public async Task<MonthlyMeta?> GetByIdAsync(int id)
    {
        return await _context.MonthlyMetas.FindAsync(id);
    }

    public async Task<MonthlyMeta> CreateAsync(MonthlyMeta meta)
    {
        _context.MonthlyMetas.Add(meta);
        await _context.SaveChangesAsync();
        return meta;
    }

    public async Task<MonthlyMeta> UpdateAsync(MonthlyMeta meta)
    {
        _context.MonthlyMetas.Update(meta);
        await _context.SaveChangesAsync();
        return meta;
    }

    public async Task DeleteAsync(int id)
    {
        var meta = await _context.MonthlyMetas.FindAsync(id);
        if (meta != null)
        {
            _context.MonthlyMetas.Remove(meta);
            await _context.SaveChangesAsync();
        }
    }
}

