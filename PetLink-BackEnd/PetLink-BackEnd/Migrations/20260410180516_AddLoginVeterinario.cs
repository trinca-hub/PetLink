using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetLink_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class AddLoginVeterinario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "veterinario",
                keyColumn: "id",
                keyValue: 1,
                column: "senha",
                value: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92");

            migrationBuilder.UpdateData(
                table: "veterinario",
                keyColumn: "id",
                keyValue: 2,
                column: "senha",
                value: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92");

            migrationBuilder.UpdateData(
                table: "veterinario",
                keyColumn: "id",
                keyValue: 3,
                column: "senha",
                value: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
    }
}
