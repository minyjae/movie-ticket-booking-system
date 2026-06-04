// store.WebAPI/Hubs/SeatNotifier.cs
using Microsoft.AspNetCore.SignalR;
using store.Application.Interfaces;

namespace store.WebAPI.Hubs;

public class SeatNotifier : ISeatNotifier
{
    private readonly IHubContext<SeatHub> _hubContext;

    public SeatNotifier(IHubContext<SeatHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task NotifySeatChangedAsync(Guid showtimeId, Guid seatId, string status)
    {
        await _hubContext.Clients
            .Group($"showtime-{showtimeId}")
            .SendAsync("SeatStatusChanged", seatId.ToString(), status);
    }
}
