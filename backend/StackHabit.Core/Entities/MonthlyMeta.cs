namespace StackHabit.Core.Entities;

public class MonthlyMeta
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public string TargetDate { get; set; } = string.Empty; // Format: "YYYY-MM"
    public string Description { get; set; } = string.Empty;
    public bool IsDone { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public User User { get; set; } = null!;
}

