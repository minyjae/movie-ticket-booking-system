// store.Application/DTOs/ScreenDto.cs
namespace store.Application.DTOs;

public record ScreenDto(
    Guid Id,
    string Name,
    int VipRows,
    int VipSeatsPerRow,
    int NormalRows,
    int NormalSeatsPerRow,
    int TotalVipSeats,
    int TotalNormalSeats,
    DateTime CreatedAt
);

public record CreateScreenDto(
    string Name,
    int VipRows,
    int VipSeatsPerRow,
    int NormalRows,
    int NormalSeatsPerRow
);
