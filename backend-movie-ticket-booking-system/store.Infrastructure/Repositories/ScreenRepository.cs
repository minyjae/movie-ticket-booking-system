// store.Infrastructure/Repositories/ScreenRepository.cs
using Microsoft.EntityFrameworkCore;
using store.Domain.Entities;
using store.Domain.Interfaces;
using store.Infrastructure.Data;

namespace store.Infrastructure.Repositories;

public class ScreenRepository : IScreenRepository
{
    private readonly AppDbContext _context;

    public ScreenRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Screen>> GetAllAsync()
        => await _context.Screens
            .OrderBy(s => s.Name)
            .ToListAsync();

    public async Task<Screen?> GetByIdAsync(Guid id)
        => await _context.Screens.FindAsync(id);

    public async Task AddAsync(Screen screen)
    {
        await _context.Screens.AddAsync(screen);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var screen = await _context.Screens.FindAsync(id)
            ?? throw new KeyNotFoundException($"Screen {id} not found.");
        _context.Screens.Remove(screen);
        await _context.SaveChangesAsync();
    }
}
