namespace StackHabit.Core.Entities;

public class DailyLog
{
    public long Id { get; set; }
    public int HabitId { get; set; }
    public DateOnly Date { get; set; }
    public bool IsCompleted { get; set; }
    public DateTime? LoggedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public Habit Habit { get; set; } = null!;
}

