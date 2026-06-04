// store.Application/DTOs/WalletDto.cs
using store.Domain.Enums;

namespace store.Application.DTOs;

public record WalletDto(
    Guid UserId,
    decimal Balance
);

public record DepositDto(
    decimal Amount
);

public record LedgerEntryDto(
    Guid Id,
    decimal Amount,
    LedgerEntryType Type,
    string Description,
    Guid? ReferenceId,
    DateTime CreatedAt
);

public record TransactionHistoryDto(
    decimal Balance,
    int Total,
    int Page,
    int PageSize,
    List<LedgerEntryDto> Entries
);