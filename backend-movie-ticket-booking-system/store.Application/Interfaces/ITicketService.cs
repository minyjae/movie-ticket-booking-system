// store.Application/Interfaces/ITicketService.cs
using store.Application.DTOs;

namespace store.Application.Interfaces;

public interface ITicketService
{
    Task<List<TicketDto>> GetMyTicketsAsync(Guid userId);
    Task<TicketDto> CancelAsync(Guid ticketId, Guid userId);
}
