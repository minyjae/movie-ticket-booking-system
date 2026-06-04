// store.WebAPI/Controllers/TicketsController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using store.Application.Interfaces;
using System.Security.Claims;

namespace store.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TicketsController : ControllerBase
{
    private readonly ITicketService _ticketService;

    public TicketsController(ITicketService ticketService)
    {
        _ticketService = ticketService;
    }

    [HttpGet("my")]                      // GET /api/tickets/my
    public async Task<IActionResult> GetMyTickets()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User not found in token.");

        var tickets = await _ticketService.GetMyTicketsAsync(Guid.Parse(userId));
        return Ok(tickets);
    }

    [HttpPost("{id}/cancel")]            // POST /api/tickets/{id}/cancel
    public async Task<IActionResult> Cancel(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User not found in token.");

        var ticket = await _ticketService.CancelAsync(id, Guid.Parse(userId));
        return Ok(ticket);
    }
}
