namespace StackHabit.Core.DTOs;

public class DashboardResponse
{
    public string Month { get; set; } = string.Empty; // "YYYY-MM"
    public List<HabitResponse> Habits { get; set; } = new();
    public Dictionary<string, bool> Logs { get; set; } = new(); // Key: "habitId-date", Value: isCompleted
    public List<MonthlyMetaResponse> MonthlyMetas { get; set; } = new();
}

