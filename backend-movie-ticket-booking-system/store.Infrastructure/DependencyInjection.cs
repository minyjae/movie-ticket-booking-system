// store.Infrastructure/DependencyInjection.cs
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using store.Domain.Interfaces;
using store.Infrastructure.Data;
using store.Infrastructure.Repositories;
using store.Application.Services;
using store.Application.Interfaces;

namespace store.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        // PostgreSQL
        // ใช้ timestamp without time zone (เก็บ UTC+7 ตรงๆ ไม่ทำ timezone conversion)
        AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

        // Railway injects DATABASE_URL (postgresql://user:pass@host:port/db)
        // Npgsql supports URI format natively; fallback to POSTGRES_CONNECTION for local dev
        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL")
            ?? Environment.GetEnvironmentVariable("POSTGRES_CONNECTION")
            ?? throw new InvalidOperationException("POSTGRES_CONNECTION is not set.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));

        // Repositories
        services.AddScoped<IMovieRepository, MovieRepository>();
        services.AddScoped<ISeatRepository, SeatRepository>();
        services.AddScoped<ILedgerRepository, LedgerRepository>();
        services.AddScoped<ITicketRepository, TicketRepository>();
        services.AddScoped<IShowtimeRepository, ShowtimeRepository>();
        services.AddScoped<IScreenRepository, ScreenRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IBannerRepository, BannerRepository>();

        // Auth Services
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtService, JwtService>();

        // Redis
        // Railway injects REDIS_URL (redis://default:pass@host:port)
        // StackExchange.Redis ไม่รองรับ URI format — แปลงก่อน
        var redisConnection = ParseRedisConnection();
        services.AddSingleton<IConnectionMultiplexer>(_ =>
            ConnectionMultiplexer.Connect(redisConnection));

        return services;
    }

    // แปลง redis://default:pass@host:port → host:port,password=pass
    private static string ParseRedisConnection()
    {
        var redisUrl = Environment.GetEnvironmentVariable("REDIS_URL");
        if (!string.IsNullOrEmpty(redisUrl))
        {
            var uri = new Uri(redisUrl);
            var host = uri.Host;
            var port = uri.Port;
            var password = uri.UserInfo.Split(':').ElementAtOrDefault(1);
            var isSsl = uri.Scheme == "rediss";

            var parts = new List<string> { $"{host}:{port}" };
            if (!string.IsNullOrEmpty(password))
                parts.Add($"password={password}");
            if (isSsl)
                parts.Add("ssl=true");

            return string.Join(",", parts);
        }

        return Environment.GetEnvironmentVariable("REDIS_CONNECTION")
            ?? throw new InvalidOperationException("REDIS_CONNECTION is not set.");
    }
}