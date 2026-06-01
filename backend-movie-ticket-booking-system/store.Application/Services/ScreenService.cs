// store.Application/Services/ScreenService.cs
using store.Application.DTOs;
using store.Application.Interfaces;
using store.Domain.Entities;
using store.Domain.Interfaces;

namespace store.Application.Services;

public class ScreenService : IScreenService
{
    private readonly IScreenRepository _screenRepository;

    public ScreenService(IScreenRepository screenRepository)
    {
        _screenRepository = screenRepository;
    }

    public async Task<List<ScreenDto>> GetAllAsync()
    {
        var screens = await _screenRepository.GetAllAsync();
        return screens.Select(MapToDto).ToList();
    }

    public async Task<ScreenDto> CreateAsync(CreateScreenDto dto)
    {
        var screen = Screen.Create(
            dto.Name,
            dto.VipRows,
            dto.VipSeatsPerRow,
            dto.NormalRows,
            dto.NormalSeatsPerRow);

        await _screenRepository.AddAsync(screen);
        return MapToDto(screen);
    }

    public async Task DeleteAsync(Guid id)
    {
        await _screenRepository.DeleteAsync(id);
    }

    private static ScreenDto MapToDto(Screen s) => new(
        s.Id, s.Name,
        s.VipRows, s.VipSeatsPerRow,
        s.NormalRows, s.NormalSeatsPerRow,
        s.TotalVipSeats, s.TotalNormalSeats,
        s.CreatedAt);
}
