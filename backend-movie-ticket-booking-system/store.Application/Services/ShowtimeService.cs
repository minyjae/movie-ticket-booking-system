// store.Application/Services/ShowtimeService.cs
using store.Application.DTOs;
using store.Application.Interfaces;
using store.Domain.Entities;
using store.Domain.Enums;
using store.Domain.Interfaces;

namespace store.Application.Services;

public class ShowtimeService : IShowtimeService
{
    private readonly IShowtimeRepository _showtimeRepository;
    private readonly IMovieRepository _movieRepository;
    private readonly IScreenRepository _screenRepository;
    private readonly ISeatRepository _seatRepository;
    private readonly ITicketRepository _ticketRepository;

    public ShowtimeService(
        IShowtimeRepository showtimeRepository,
        IMovieRepository movieRepository,
        IScreenRepository screenRepository,
        ISeatRepository seatRepository,
        ITicketRepository ticketRepository)
    {
        _showtimeRepository = showtimeRepository;
        _movieRepository    = movieRepository;
        _screenRepository   = screenRepository;
        _seatRepository     = seatRepository;
        _ticketRepository   = ticketRepository;
    }

    public async Task<ShowtimeDto?> GetByIdAsync(Guid showtimeId)
    {
        var showtime = await _showtimeRepository.GetByIdAsync(showtimeId);
        if (showtime is null) return null;
        var available = await _seatRepository.CountAvailableByShowtimeAsync(showtimeId);
        return MapToDto(showtime, available);
    }

    public async Task<List<ShowtimeDto>> GetAllAsync()
    {
        var showtimes = await _showtimeRepository.GetAllAsync();
        return await MapToDtosAsync(showtimes);
    }

    public async Task<List<ShowtimeDto>> GetByMovieIdAsync(Guid movieId)
    {
        var showtimes = await _showtimeRepository.GetByMovieIdAsync(movieId);
        return await MapToDtosAsync(showtimes);
    }

    public async Task<ShowtimeDto> CreateAsync(CreateShowtimeDto dto)
    {
        var movie = await _movieRepository.GetByIdAsync(dto.MovieId)
            ?? throw new KeyNotFoundException($"Movie {dto.MovieId} not found.");

        var screen = await _screenRepository.GetByIdAsync(dto.ScreenId)
            ?? throw new KeyNotFoundException($"Screen {dto.ScreenId} not found.");

        var showtime = Showtime.Create(
            movieId:         movie.Id,
            movieName:       movie.Title,
            screenId:        screen.Id,
            screenName:      screen.Name,
            startTime:       dto.StartTime,
            durationMinutes: (int)movie.Duration.TotalMinutes);

        await _showtimeRepository.AddAsync(showtime);
        var seatCount = await GenerateSeatsAsync(showtime.Id, movie.Price, screen);
        return MapToDto(showtime, seatCount);
    }

    private async Task<int> GenerateSeatsAsync(Guid showtimeId, decimal moviePrice, Screen screen)
    {
        var normalPrice = moviePrice;
        var vipPrice    = Math.Round(moviePrice * 2.5m, 2);

        var seats = new List<Seat>();

        // VIP rows: A, B, C, ...
        for (int r = 0; r < screen.VipRows; r++)
        {
            var row = (char)('A' + r);
            for (int col = 1; col <= screen.VipSeatsPerRow; col++)
                seats.Add(Seat.Create(showtimeId, $"{row}{col}", SeatType.VIP, vipPrice));
        }

        // Normal rows: continue lettering after VIP rows
        for (int r = 0; r < screen.NormalRows; r++)
        {
            var row = (char)('A' + screen.VipRows + r);
            for (int col = 1; col <= screen.NormalSeatsPerRow; col++)
                seats.Add(Seat.Create(showtimeId, $"{row}{col}", SeatType.Normal, normalPrice));
        }

        await _seatRepository.AddRangeAsync(seats);
        return seats.Count;
    }

    public async Task DeleteAsync(DeleteShowtimeDto dto)
    {
        await _ticketRepository.DeleteByShowtimeIdAsync(dto.Id);
        await _seatRepository.DeleteByShowtimeIdAsync(dto.Id);
        await _showtimeRepository.DeleteAsync(dto.Id);
    }

    private async Task<List<ShowtimeDto>> MapToDtosAsync(List<Showtime> showtimes)
    {
        var result = new List<ShowtimeDto>();
        foreach (var s in showtimes)
        {
            var available = await _seatRepository.CountAvailableByShowtimeAsync(s.Id);
            result.Add(MapToDto(s, available));
        }
        return result;
    }

    private static ShowtimeDto MapToDto(Showtime s, int availableSeats) =>
        new(s.Id, s.MovieId, s.MovieName, s.ScreenId, s.ScreenName, s.StartTime, s.EndTime, availableSeats, s.IsActive);
}