using Microsoft.EntityFrameworkCore;
using StackHabit.Core.Entities;

namespace StackHabit.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<Habit> Habits { get; set; }
    public DbSet<DailyLog> DailyLogs { get; set; }
    public DbSet<MonthlyMeta> MonthlyMetas { get; set; }
    public DbSet<MonthlyReview> MonthlyReviews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Email).IsRequired().HasMaxLength(150);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("CURRENT_TIMESTAMP");
        });

        // Habit
        modelBuilder.Entity<Habit>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.Habits)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(100);
            entity.Property(e => e.ColorHex).HasMaxLength(7).HasDefaultValue("#3B82F6");
            entity.Property(e => e.IsArchived).HasDefaultValue(false);
        });

        // DailyLog
        modelBuilder.Entity<DailyLog>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.Habit)
                  .WithMany(h => h.DailyLogs)
                  .HasForeignKey(e => e.HabitId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(e => new { e.HabitId, e.Date }).IsUnique();
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.IsCompleted).IsRequired();
        });

        // MonthlyMeta
        modelBuilder.Entity<MonthlyMeta>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.MonthlyMetas)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.TargetDate).IsRequired().HasMaxLength(7); // "YYYY-MM"
            entity.Property(e => e.Description).IsRequired().HasMaxLength(255);
            entity.Property(e => e.IsDone).HasDefaultValue(false);
        });

        // MonthlyReview
        modelBuilder.Entity<MonthlyReview>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.MonthlyReviews)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
            entity.Property(e => e.TargetDate).IsRequired().HasMaxLength(7); // "YYYY-MM"
            entity.Property(e => e.Content).IsRequired().HasMaxLength(2000);
            entity.HasIndex(e => new { e.UserId, e.TargetDate }).IsUnique(); // Uma review por usuário por mês
        });
    }
}

