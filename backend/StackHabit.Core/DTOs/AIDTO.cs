namespace StackHabit.Core.DTOs;

public class ReviewGuidanceResponse
{
    public List<string> Questions { get; set; } = new List<string>();
    public List<string> Tips { get; set; } = new List<string>();
    public string SuggestedStructure { get; set; } = string.Empty;
    public List<string> PendingReasons { get; set; } = new List<string>();
    public List<string> UnmetGoalsReasons { get; set; } = new List<string>();
}

public class HabitProgressData
{
    public string Title { get; set; } = string.Empty;
    public int CompletedDays { get; set; }
    public int TotalDays { get; set; }
    public double CompletionRate { get; set; }
    public int CurrentStreak { get; set; }
    public int LongestStreak { get; set; }
}

public class ReviewGuidanceRequest
{
    public string Month { get; set; } = string.Empty;
    public List<HabitProgressData> Habits { get; set; } = new List<HabitProgressData>();
    public List<string> MonthlyMetas { get; set; } = new List<string>();
    public List<UnmetGoalData> UnmetGoals { get; set; } = new List<UnmetGoalData>();
}

public class UnmetGoalData
{
    public string Description { get; set; } = string.Empty;
    public bool IsDone { get; set; }
}

public class ImproveReviewRequest
{
    public string CurrentText { get; set; } = string.Empty;
    public string Month { get; set; } = string.Empty;
    public List<HabitProgressData> Habits { get; set; } = new List<HabitProgressData>();
    public List<string> MonthlyMetas { get; set; } = new List<string>();
}

