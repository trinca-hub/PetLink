using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetLink_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class correcaoServico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "data",
                table: "servico");

            migrationBuilder.DropColumn(
                name: "hora",
                table: "servico");

            migrationBuilder.AddColumn<DateTime>(
                name: "dataServico",
                table: "servico",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.UpdateData(
                table: "servico",
                keyColumn: "id",
                keyValue: 1,
                column: "dataServico",
                value: new DateTime(2025, 10, 15, 0, 28, 32, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "servico",
                keyColumn: "id",
                keyValue: 2,
                column: "dataServico",
                value: new DateTime(2025, 9, 18, 15, 20, 22, 0, DateTimeKind.Utc));

            migrationBuilder.UpdateData(
                table: "servico",
                keyColumn: "id",
                keyValue: 3,
                column: "dataServico",
                value: new DateTime(2025, 6, 27, 10, 47, 2, 0, DateTimeKind.Utc));
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "dataServico",
                table: "servico");

            migrationBuilder.AddColumn<string>(
                name: "data",
                table: "servico",
                type: "character varying(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "hora",
                table: "servico",
                type: "character varying(11)",
                maxLength: 11,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "servico",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "data", "hora" },
                values: new object[] { "10/10/2010", "10h 10m 10s" });

            migrationBuilder.UpdateData(
                table: "servico",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "data", "hora" },
                values: new object[] { "20/12/2020", "20h 20m 20s" });

            migrationBuilder.UpdateData(
                table: "servico",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "data", "hora" },
                values: new object[] { "20/05/2025", "15h 25m 25s" });
        }
    }
}
