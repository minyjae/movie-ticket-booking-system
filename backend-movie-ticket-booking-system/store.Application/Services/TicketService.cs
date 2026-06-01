// store.Application/Services/TicketService.cs
using store.Application.DTOs;
using store.Application.Interfaces;
using store.Domain.Interfaces;

namespace store.Application.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository _ticketRepository;

    public TicketService(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<List<TicketDto>> GetMyTicketsAsync(Guid userId)
    {
        var tickets = await _ticketRepository.GetByUserIdAsync(userId);
        return tickets
            .OrderByDescending(t => t.IssuedAt)
            .Select(t => new TicketDto(
                t.Id,
                t.MovieName,
                t.SeatCode,
                t.Showtime,
                t.PricePaid,
                t.ReferenceCode,
                t.QrCodeBase64,
                t.IssuedAt))
            .ToList();
    }
}
