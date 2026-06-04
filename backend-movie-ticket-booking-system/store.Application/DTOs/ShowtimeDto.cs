// store.Application/DTOs/ShowtimeDto.cs
namespace store.Application.DTOs;

public record ShowtimeDto(
    Guid Id,
    Guid MovieId,
    string MovieName,
    Guid ScreenId,
    string ScreenName,
    DateTime StartTime,
    DateTime EndTime,
    bool IsActive
);

public record CreateShowtimeDto(
    Guid MovieId,
    Guid ScreenId,
    DateTime StartTime
);

public record DeleteShowtimeDto(
    Guid Id
);