// store.Domain/Entities/Screen.cs
namespace store.Domain.Entities;

public class Screen
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public string Name { get; private set; } = string.Empty;
    public int VipRows { get; private set; }
    public int VipSeatsPerRow { get; private set; }
    public int NormalRows { get; private set; }
    public int NormalSeatsPerRow { get; private set; }
    public DateTime CreatedAt { get; private set; }

    public int TotalVipSeats => VipRows * VipSeatsPerRow;
    public int TotalNormalSeats => NormalRows * NormalSeatsPerRow;

    public ICollection<Showtime> Showtimes { get; private set; } = [];

    private Screen() {}

    public static Screen Create(string name, int vipRows, int vipSeatsPerRow,
                                int normalRows, int normalSeatsPerRow)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Screen name is required.");
        if (normalRows < 1)
            throw new ArgumentException("Screen must have at least 1 normal row.");
        if (normalSeatsPerRow < 1)
            throw new ArgumentException("Normal seats per row must be at least 1.");
        if (vipRows > 0 && vipSeatsPerRow < 1)
            throw new ArgumentException("VIP seats per row must be at least 1.");

        return new Screen
        {
            Name             = name.Trim(),
            VipRows          = vipRows,
            VipSeatsPerRow   = vipSeatsPerRow,
            NormalRows       = normalRows,
            NormalSeatsPerRow = normalSeatsPerRow,
            CreatedAt        = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Asia/Bangkok"),
        };
    }
}
