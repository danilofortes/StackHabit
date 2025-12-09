namespace StackHabit.Core.Entities;

public class MonthlyReview
{
    public int Id { get; set; }
    public Guid UserId { get; set; }
    public string TargetDate { get; set; } = string.Empty; // Format: "YYYY-MM"
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public User User { get; set; } = null!;
}

