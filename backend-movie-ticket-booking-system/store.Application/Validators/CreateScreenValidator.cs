// store.Application/Validators/CreateScreenValidator.cs
using FluentValidation;
using store.Application.DTOs;

namespace store.Application.Validators;

public class CreateScreenValidator : AbstractValidator<CreateScreenDto>
{
    public CreateScreenValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Screen name is required.")
            .MaximumLength(100).WithMessage("Screen name must not exceed 100 characters.");

        RuleFor(x => x.NormalRows)
            .GreaterThanOrEqualTo(1).WithMessage("Screen must have at least 1 normal row.");

        RuleFor(x => x.NormalSeatsPerRow)
            .GreaterThanOrEqualTo(1).WithMessage("Normal seats per row must be at least 1.");

        RuleFor(x => x.VipRows)
            .GreaterThanOrEqualTo(0).WithMessage("VIP rows cannot be negative.");

        RuleFor(x => x.VipSeatsPerRow)
            .GreaterThanOrEqualTo(0).WithMessage("VIP seats per row cannot be negative.");

        RuleFor(x => x)
            .Must(x => x.VipRows == 0 || x.VipSeatsPerRow > 0)
            .WithMessage("VIP seats per row must be at least 1 when VIP rows > 0.");
    }
}
