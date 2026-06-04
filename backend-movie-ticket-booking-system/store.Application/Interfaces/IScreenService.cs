// store.Application/Interfaces/IScreenService.cs
using store.Application.DTOs;

namespace store.Application.Interfaces;

public interface IScreenService
{
    Task<List<ScreenDto>> GetAllAsync();
    Task<ScreenDto> CreateAsync(CreateScreenDto dto);
    Task DeleteAsync(Guid id);
}
