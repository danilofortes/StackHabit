namespace StackHabit.Core.Entities;

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public ICollection<Habit> Habits { get; set; } = new List<Habit>();
    public ICollection<MonthlyMeta> MonthlyMetas { get; set; } = new List<MonthlyMeta>();
    public ICollection<MonthlyReview> MonthlyReviews { get; set; } = new List<MonthlyReview>();
}

