using StackHabit.Core.DTOs;

namespace StackHabit.Core.Interfaces;

public interface IAIService
{
    Task<ReviewGuidanceResponse> GetReviewGuidanceAsync(string month, List<HabitProgressData> habits, List<string> monthlyMetas, List<UnmetGoalData> unmetGoals);
    Task<string> ImproveReviewTextAsync(string currentText, string month, List<HabitProgressData> habits, List<string> monthlyMetas);
}

