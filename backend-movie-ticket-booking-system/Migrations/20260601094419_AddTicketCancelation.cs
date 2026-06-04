using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace movie_ticket_booking_system.Migrations
{
    /// <inheritdoc />
    public partial class AddTicketCancelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CancelledAt",
                table: "Tickets",
                type: "timestamp without time zone",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsCancelled",
                table: "Tickets",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CancelledAt",
                table: "Tickets");

            migrationBuilder.DropColumn(
                name: "IsCancelled",
                table: "Tickets");
        }
    }
}
