using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace movie_ticket_booking_system.Migrations
{
    /// <inheritdoc />
    public partial class AddAvailableSeatsToShowtime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AvaliableSeats",
                table: "Showtimes",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AvaliableSeats",
                table: "Showtimes");
        }
    }
}
