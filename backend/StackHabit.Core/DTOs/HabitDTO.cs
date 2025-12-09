namespace StackHabit.Core.DTOs;

public class HabitResponse
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ColorHex { get; set; }
    public bool IsArchived { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateHabitRequest
{
    public string Title { get; set; } = string.Empty;
    public string? ColorHex { get; set; }
}

public class UpdateHabitRequest
{
    public string Title { get; set; } = string.Empty;
    public string? ColorHex { get; set; }
    public bool IsArchived { get; set; }
}

