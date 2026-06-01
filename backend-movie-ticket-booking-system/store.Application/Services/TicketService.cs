// store.Application/Services/TicketService.cs
using Microsoft.EntityFrameworkCore;
using store.Application.DTOs;
using store.Application.Interfaces;
using store.Domain.Entities;
using store.Domain.Interfaces;
using store.Infrastructure.Data;

namespace store.Application.Services;

public class TicketService : ITicketService
{
    private readonly ITicketRepository  _ticketRepository;
    private readonly ISeatRepository    _seatRepository;
    private readonly ILedgerRepository  _ledgerRepository;
    private readonly AppDbContext       _context;

    public TicketService(
        ITicketRepository  ticketRepository,
        ISeatRepository    seatRepository,
        ILedgerRepository  ledgerRepository,
        AppDbContext       context)
    {
        _ticketRepository = ticketRepository;
        _seatRepository   = seatRepository;
        _ledgerRepository = ledgerRepository;
        _context          = context;
    }

    public async Task<List<TicketDto>> GetMyTicketsAsync(Guid userId)
    {
        var tickets = await _ticketRepository.GetByUserIdAsync(userId);
        return tickets
            .OrderByDescending(t => t.IssuedAt)
            .Select(MapToDto)
            .ToList();
    }

    public async Task<TicketDto> CancelAsync(Guid ticketId, Guid userId)
    {
        var ticket = await _ticketRepository.GetByIdAsync(ticketId)
            ?? throw new KeyNotFoundException("Ticket not found.");

        if (ticket.UserId != userId)
            throw new UnauthorizedAccessException("You can only cancel your own tickets.");

        if (ticket.IsCancelled)
            throw new InvalidOperationException("Ticket is already cancelled.");

        var now = TimeZoneInfo.ConvertTimeBySystemTimeZoneId(DateTime.UtcNow, "Asia/Bangkok");
        if (ticket.Showtime <= now)
            throw new InvalidOperationException("Cannot cancel a ticket for a past showtime.");

        var seat = await _seatRepository.GetByIdAsync(ticket.SeatId)
            ?? throw new KeyNotFoundException("Seat not found.");

        await using var transaction = await _context.Database.BeginTransactionAsync();
        try
        {
            ticket.Cancel();
            seat.Restore();

            var refund = LedgerEntry.CreateRefund(userId, ticket.PricePaid, ticket.Id);
            await _ledgerRepository.AppendAsync(refund);

            await _context.SaveChangesAsync();
            await transaction.CommitAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            await transaction.RollbackAsync();
            throw new InvalidOperationException("Could not cancel ticket due to a conflict. Please try again.");
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }

        return MapToDto(ticket);
    }

    private static TicketDto MapToDto(Ticket t) => new(
        t.Id, t.MovieName, t.SeatCode, t.Showtime, t.PricePaid,
        t.ReferenceCode, t.QrCodeBase64, t.IssuedAt, t.IsCancelled, t.CancelledAt);
}
