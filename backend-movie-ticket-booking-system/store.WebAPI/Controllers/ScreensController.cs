// store.WebAPI/Controllers/ScreensController.cs
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using store.Application.DTOs;
using store.Application.Interfaces;

namespace store.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScreensController : ControllerBase
{
    private readonly IScreenService _screenService;
    private readonly IValidator<CreateScreenDto> _createValidator;

    public ScreensController(IScreenService screenService, IValidator<CreateScreenDto> createValidator)
    {
        _screenService   = screenService;
        _createValidator = createValidator;
    }

    [HttpGet]                           // GET /api/screens  (public — frontend needs for booking info)
    public async Task<IActionResult> GetAll()
    {
        var screens = await _screenService.GetAllAsync();
        return Ok(screens);
    }

    [HttpPost]                          // POST /api/screens
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create([FromBody] CreateScreenDto dto)
    {
        var validation = await _createValidator.ValidateAsync(dto);
        if (!validation.IsValid)
            return BadRequest(validation.Errors.Select(e => e.ErrorMessage));

        var screen = await _screenService.CreateAsync(dto);
        return CreatedAtAction(nameof(GetAll), screen);
    }

    [HttpDelete("{id}")]               // DELETE /api/screens/{id}
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _screenService.DeleteAsync(id);
        return NoContent();
    }
}
