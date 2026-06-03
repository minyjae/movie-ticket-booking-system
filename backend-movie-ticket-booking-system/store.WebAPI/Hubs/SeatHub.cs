// store.WebAPI/Hubs/SeatHub.cs
using Microsoft.AspNetCore.SignalR;

namespace store.WebAPI.Hubs;

public class SeatHub : Hub
{
    // Client เรียกเพื่อ subscribe รอบฉายนี้
    public async Task JoinShowtime(string showtimeId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"showtime-{showtimeId}");
    }

    // Client เรียกเมื่อออกจากหน้า (optional — SignalR ลบ group อัตโนมัติเมื่อ disconnect)
    public async Task LeaveShowtime(string showtimeId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"showtime-{showtimeId}");
    }
}
