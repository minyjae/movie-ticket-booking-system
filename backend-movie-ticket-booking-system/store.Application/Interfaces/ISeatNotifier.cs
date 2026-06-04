// store.Application/Interfaces/ISeatNotifier.cs
namespace store.Application.Interfaces;

public interface ISeatNotifier
{
    Task NotifySeatChangedAsync(Guid showtimeId, Guid seatId, string status);
}
