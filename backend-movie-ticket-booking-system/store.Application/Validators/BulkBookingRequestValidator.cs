// store.Application/Validators/BulkBookingRequestValidator.cs
using FluentValidation;
using store.Application.DTOs;

namespace store.Application.Validators;

public class BulkBookingRequestValidator : AbstractValidator<BulkBookingRequestDto>
{
    public BulkBookingRequestValidator()
    {
        RuleFor(x => x.SeatIds)
            .NotEmpty().WithMessage("SeatIds is required.")
            .Must(ids => ids.Length <= 10).WithMessage("Cannot book more than 10 seats at once.");

        RuleFor(x => x.ShowtimeId)
            .NotEmpty().WithMessage("ShowtimeId is required.");
    }
}
