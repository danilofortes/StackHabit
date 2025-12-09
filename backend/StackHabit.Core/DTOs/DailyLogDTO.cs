namespace StackHabit.Core.DTOs;

public class DailyLogResponse
{
    public long Id { get; set; }
    public int HabitId { get; set; }
    public string Date { get; set; } = string.Empty; // YYYY-MM-DD
    public bool IsCompleted { get; set; }
}

public class ToggleHabitRequest
{
    public string Date { get; set; } = string.Empty; // YYYY-MM-DD
}

