using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace movie_ticket_booking_system.Migrations
{
    /// <inheritdoc />
    public partial class AddScreenEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // ล้างข้อมูลเก่าที่มี ScreenId เป็น string (ไม่สามารถ cast เป็น uuid ได้)
            migrationBuilder.Sql("DELETE FROM \"Tickets\";");
            migrationBuilder.Sql("DELETE FROM \"Seats\";");
            migrationBuilder.Sql("DELETE FROM \"Showtimes\";");

            // สร้าง Screens table ก่อน (จำเป็นสำหรับ FK)
            migrationBuilder.CreateTable(
                name: "Screens",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    VipRows = table.Column<int>(type: "integer", nullable: false),
                    VipSeatsPerRow = table.Column<int>(type: "integer", nullable: false),
                    NormalRows = table.Column<int>(type: "integer", nullable: false),
                    NormalSeatsPerRow = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp without time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Screens", x => x.Id);
                });

            // Drop + Add แทน AlterColumn เพื่อเลี่ยง PostgreSQL type cast error
            migrationBuilder.DropColumn(name: "ScreenId", table: "Showtimes");
            migrationBuilder.AddColumn<Guid>(
                name: "ScreenId",
                table: "Showtimes",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Showtimes_ScreenId",
                table: "Showtimes",
                column: "ScreenId");

            migrationBuilder.AddForeignKey(
                name: "FK_Showtimes_Screens_ScreenId",
                table: "Showtimes",
                column: "ScreenId",
                principalTable: "Screens",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Showtimes_Screens_ScreenId",
                table: "Showtimes");

            migrationBuilder.DropTable(
                name: "Screens");

            migrationBuilder.DropIndex(
                name: "IX_Showtimes_ScreenId",
                table: "Showtimes");

            migrationBuilder.AlterColumn<string>(
                name: "ScreenId",
                table: "Showtimes",
                type: "text",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid");
        }
    }
}
