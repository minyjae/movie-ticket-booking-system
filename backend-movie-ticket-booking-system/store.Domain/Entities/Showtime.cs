// store.Domain/Entities/Showtime.cs
namespace store.Domain.Entities;

public class Showtime
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public Guid MovieId { get; private set; }
    public string MovieName { get; private set; } = string.Empty;
    public Guid ScreenId { get; private set; }
    public string ScreenName { get; private set; } = string.Empty;
    public DateTime StartTime { get; private set; }
    public DateTime EndTime { get; private set; }
    public bool IsActive =>
        EndTime > TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Asia/Bangkok");

    // Navigation Properties
    public Movie? Movie { get; private set; }
    public Screen? Screen { get; private set; }

    private Showtime() {}

    public static Showtime Create(Guid movieId, string movieName,
                                   Guid screenId, string screenName,
                                   DateTime startTime, int durationMinutes)
    {
        if (startTime < TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Asia/Bangkok"))
            throw new ArgumentException("Showtime cannot be in the past.");

        return new Showtime
        {
            MovieId    = movieId,
            MovieName  = movieName,
            ScreenId   = screenId,
            ScreenName = screenName,   // snapshot ณ เวลาสร้าง
            StartTime  = startTime,
            EndTime    = startTime.AddMinutes(durationMinutes)
        };
    }
}