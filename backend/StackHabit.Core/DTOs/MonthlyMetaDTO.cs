namespace StackHabit.Core.DTOs;

public class MonthlyMetaResponse
{
    public int Id { get; set; }
    public string TargetDate { get; set; } = string.Empty; // "YYYY-MM"
    public string Description { get; set; } = string.Empty;
    public bool IsDone { get; set; }
}

public class CreateMonthlyMetaRequest
{
    public string TargetDate { get; set; } = string.Empty; // "YYYY-MM"
    public string Description { get; set; } = string.Empty;
}

