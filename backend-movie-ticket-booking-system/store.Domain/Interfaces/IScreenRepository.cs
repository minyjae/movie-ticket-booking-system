// store.Domain/Interfaces/IScreenRepository.cs
using store.Domain.Entities;

namespace store.Domain.Interfaces;

public interface IScreenRepository
{
    Task<List<Screen>> GetAllAsync();
    Task<Screen?> GetByIdAsync(Guid id);
    Task AddAsync(Screen screen);
    Task DeleteAsync(Guid id);
}
