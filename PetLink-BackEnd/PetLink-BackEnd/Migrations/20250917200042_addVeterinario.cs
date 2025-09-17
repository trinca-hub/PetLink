using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PetLink_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class addVeterinario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "veterinario",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    crmv = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    salario = table.Column<float>(type: "real", nullable: false),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_veterinario", x => x.id);
                });

            migrationBuilder.InsertData(
                table: "veterinario",
                columns: new[] { "id", "crmv", "email", "nome", "salario", "status" },
                values: new object[,]
                {
                    { 1, "4750", "gabriel@gmail.com", "Gabriel", 100000f, 2 },
                    { 2, "7452", "enzo@gmail.com", "Enzo", 100000f, 1 },
                    { 3, "0001", "yasmin@gmail.com", "Yasmin", 100000f, 1 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "veterinario");
        }
    }
}
