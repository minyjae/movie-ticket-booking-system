// store.Application/Services/WalletService.cs
using store.Application.DTOs;
using store.Application.Interfaces;
using store.Domain.Entities;
using store.Domain.Interfaces;

namespace store.Application.Services;

public class WalletService : IWalletService
{
    private readonly ILedgerRepository _ledgerRepository;

    // สร้าง Snapshot ทุก 100 transactions
    private const int SnapshotThreshold = 100;

    public WalletService(ILedgerRepository ledgerRepository)
    {
        _ledgerRepository = ledgerRepository;
    }

    public async Task<decimal> GetBalanceAsync(Guid userId)
        => await _ledgerRepository.GetBalanceAsync(userId);

    public async Task DepositAsync(Guid userId, decimal amount)
    {
        var entry = LedgerEntry.CreateDeposit(userId, amount);
        await _ledgerRepository.AppendAsync(entry);
        await _ledgerRepository.SaveAsync();      // บันทึก entry ลง DB

        // เช็คว่าถึงเวลาสร้าง Snapshot ไหม
        await TryCreateSnapshotAsync(userId);
    }

    public async Task<TransactionHistoryDto> GetHistoryAsync(Guid userId, int page, int pageSize)
    {
        pageSize = Math.Clamp(pageSize, 1, 50);
        page     = Math.Max(page, 1);

        var balance = await _ledgerRepository.GetBalanceAsync(userId);
        var (entries, total) = await _ledgerRepository.GetHistoryAsync(userId, page, pageSize);

        var dtos = entries.Select(e => new LedgerEntryDto(
            e.Id, e.Amount, e.Type, e.Description, e.ReferenceId, e.CreatedAt
        )).ToList();

        return new TransactionHistoryDto(balance, total, page, pageSize, dtos);
    }

    private async Task TryCreateSnapshotAsync(Guid userId)
    {
        var entryCount = await _ledgerRepository.CountEntriesAfterSnapshotAsync(userId);

        if (entryCount < SnapshotThreshold) return;

        // ถึง Threshold → คำนวณ Balance ปัจจุบันแล้วสร้าง Snapshot ใหม่
        var currentBalance = await _ledgerRepository.GetBalanceAsync(userId);
        var lastEntryId = await _ledgerRepository.GetLastEntryIdAsync(userId);

        if (lastEntryId is null) return;

        var snapshot = WalletSnapshot.Create(userId, currentBalance, lastEntryId.Value);
        await _ledgerRepository.SaveSnapshotAsync(snapshot);
    }
}