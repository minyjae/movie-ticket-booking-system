// store.Application/Services/TicketBookingService.cs
using Microsoft.EntityFrameworkCore;
using QRCoder;
using StackExchange.Redis;
using store.Application.Interfaces;
using store.Domain.Entities;
using store.Domain.Enums;
using store.Domain.Interfaces;
using store.Infrastructure.Data;

namespace store.Application.Services;

public class TicketBookingService : ITicketBookingService
{
    private readonly ISeatRepository _seatRepository;
    private readonly ILedgerRepository _ledgerRepository;
    private readonly ITicketRepository _ticketRepository;
    private readonly IShowtimeRepository _showtimeRepository;
    private readonly AppDbContext _context;
    private readonly IConnectionMultiplexer _redis;
    private readonly ISeatNotifier _seatNotifier;

    private static readonly TimeSpan LockDuration = TimeSpan.FromMinutes(5);

    public TicketBookingService(
        ISeatRepository seatRepository,
        ILedgerRepository ledgerRepository,
        ITicketRepository ticketRepository,
        IShowtimeRepository showtimeRepository,
        AppDbContext context,
        IConnectionMultiplexer redis,
        ISeatNotifier seatNotifier)
    {
        _seatRepository     = seatRepository;
        _ledgerRepository   = ledgerRepository;
        _ticketRepository   = ticketRepository;
        _showtimeRepository = showtimeRepository;
        _context            = context;
        _redis              = redis;
        _seatNotifier       = seatNotifier;
    }

    public async Task<Ticket> BookSeatAsync(Guid userId, Guid seatId, Guid showtimeId)
    {
        var seat = await _seatRepository.GetByIdAsync(seatId)
            ?? throw new KeyNotFoundException($"Seat {seatId} not found.");

        var showtime = await _showtimeRepository.GetByIdAsync(showtimeId)
            ?? throw new KeyNotFoundException($"Showtime {showtimeId} not found.");

        // ── Redis Distributed Lock ───────────────────
        var lockKey   = $"seat-lock:{seatId}";
        var lockValue = userId.ToString();
        var db        = _redis.GetDatabase();

        var lockAcquired = await db.StringSetAsync(
            lockKey, lockValue, LockDuration, When.NotExists);

        if (!lockAcquired)
            throw new InvalidOperationException(
                $"Seat {seat.SeatCode} is currently being booked. Try again.");

        try
        {
            // ── เช็ค Balance ─────────────────────────
            var balance = await _ledgerRepository.GetBalanceAsync(userId);
            if (balance < seat.Price)
                throw new InvalidOperationException(
                    $"Insufficient balance. Required: {seat.Price:C}, Available: {balance:C}");

            // ── สร้าง Ticket ──────────────────────────
            var ticket = Ticket.Create(userId, showtimeId, seatId,
                seat.SeatCode, showtime.MovieName, showtime.StartTime, seat.Price);
            ticket.SetQrCode(GenerateQrCode(ticket.ReferenceCode));

            // ── EF Core Transaction ───────────────────
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. ตัดเงิน
                var ledgerEntry = LedgerEntry.CreateTicketPurchase(userId, seat.Price, ticket.Id);
                await _ledgerRepository.AppendAsync(ledgerEntry);

                // 2. เปลี่ยน Status Seat → Booked (OCC ผ่าน xmin)
                seat.Book();
                await _seatRepository.UpdateAsync(seat);

                // 3. บันทึก Ticket
                await _ticketRepository.AddAsync(ticket);

                // SaveChanges ครั้งเดียว — ทุกอย่างอยู่ใน Transaction เดียวกัน
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                await transaction.RollbackAsync();
                throw new InvalidOperationException(
                    $"Seat {seat.SeatCode} was just booked by someone else.");
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }

            // Notify clients ที่ subscribe รอบฉายนี้อยู่ (best-effort — ไม่ rollback ถ้า fail)
            try { await _seatNotifier.NotifySeatChangedAsync(showtimeId, seatId, "Booked"); }
            catch { /* real-time update ล้มเหลวไม่กระทบ booking */ }

            return ticket;
        }
        finally
        {
            // Release Lock เสมอ
            var current = await db.StringGetAsync(lockKey);
            if (current == lockValue)
                await db.KeyDeleteAsync(lockKey);
        }
    }

    public async Task<List<Ticket>> BookSeatsAsync(Guid userId, Guid[] seatIds, Guid showtimeId)
    {
        // โหลด seat ทั้งหมดของรอบฉาย แล้ว filter เอาเฉพาะที่ขอมา
        var allSeats = await _seatRepository.GetByShowtimeAsync(showtimeId);
        var seatMap = allSeats.ToDictionary(s => s.Id);

        var seats = new List<Seat>();
        foreach (var id in seatIds)
        {
            if (!seatMap.TryGetValue(id, out var seat))
                throw new KeyNotFoundException($"Seat {id} not found.");
            seats.Add(seat);
        }

        // ตรวจล่วงหน้า: ต้องว่างทุกที่ ก่อนจองใดๆ (fail fast)
        var unavailable = seats.Where(s => s.Status != SeatStatus.Available).ToList();
        if (unavailable.Count > 0)
            throw new InvalidOperationException(
                $"ที่นั่งต่อไปนี้ไม่ว่าง: {string.Join(", ", unavailable.Select(s => s.SeatCode))}");

        // ตรวจล่วงหน้า: ยอดเงินต้องพอสำหรับทุกที่นั่งรวมกัน (fail fast)
        var total = seats.Sum(s => s.Price);
        var balance = await _ledgerRepository.GetBalanceAsync(userId);
        if (balance < total)
            throw new InvalidOperationException(
                $"ยอดเงินไม่พอ ต้องการ {total:C} มีในกระเป๋า {balance:C}");

        // จองทีละที่แบบ sequential ใช้ BookSeatAsync ที่มีอยู่แล้ว
        var tickets = new List<Ticket>();
        foreach (var seat in seats)
        {
            var ticket = await BookSeatAsync(userId, seat.Id, showtimeId);
            tickets.Add(ticket);
        }

        return tickets;
    }

    private static string GenerateQrCode(string referenceCode)
    {
        using var generator = new QRCodeGenerator();
        using var data = generator.CreateQrCode(referenceCode, QRCodeGenerator.ECCLevel.Q);
        using var qrCode = new PngByteQRCode(data);
        var pngBytes = qrCode.GetGraphic(10);
        return Convert.ToBase64String(pngBytes);
    }
}