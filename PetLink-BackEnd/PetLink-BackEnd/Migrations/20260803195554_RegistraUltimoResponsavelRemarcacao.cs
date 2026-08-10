using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetLink_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class RegistraUltimoResponsavelRemarcacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ultimoresponsavelremarcacao",
                table: "agendamentoconsulta",
                type: "integer",
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_agendamentoconsulta_ultimo_responsavel",
                table: "agendamentoconsulta",
                sql: "ultimoresponsavelremarcacao IS NULL OR ultimoresponsavelremarcacao IN (1, 2)");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_agendamentoconsulta_ultimo_responsavel",
                table: "agendamentoconsulta");

            migrationBuilder.DropColumn(
                name: "ultimoresponsavelremarcacao",
                table: "agendamentoconsulta");
        }
    }
}
