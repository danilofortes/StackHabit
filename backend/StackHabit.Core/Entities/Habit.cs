namespace StackHabit.Core.Entities;

public class Habit
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ColorHex { get; set; } = "#3B82F6";
    public bool IsArchived { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User User { get; set; } = null!;
    public ICollection<DailyLog> DailyLogs { get; set; } = new List<DailyLog>();
}

