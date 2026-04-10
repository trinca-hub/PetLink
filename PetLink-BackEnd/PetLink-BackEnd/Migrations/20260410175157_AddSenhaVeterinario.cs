using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetLink_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class AddSenhaVeterinario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "senha",
                table: "veterinario",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "veterinario",
                keyColumn: "id",
                keyValue: 1,
                column: "senha",
                value: "123456");

            migrationBuilder.UpdateData(
                table: "veterinario",
                keyColumn: "id",
                keyValue: 2,
                column: "senha",
                value: "123456");

            migrationBuilder.UpdateData(
                table: "veterinario",
                keyColumn: "id",
                keyValue: 3,
                column: "senha",
                value: "123456");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "senha",
                table: "veterinario");
        }
    }
}
