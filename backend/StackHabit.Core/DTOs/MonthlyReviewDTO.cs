namespace StackHabit.Core.DTOs;

public class MonthlyReviewResponse
{
    public int Id { get; set; }
    public string TargetDate { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class CreateMonthlyReviewRequest
{
    public string TargetDate { get; set; } = string.Empty; // "YYYY-MM"
    public string Content { get; set; } = string.Empty;
}

public class UpdateMonthlyReviewRequest
{
    public string Content { get; set; } = string.Empty;
}

