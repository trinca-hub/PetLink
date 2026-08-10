using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetLink_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class RestringeAceiteEHorarioAgenda : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_agendaveterinario_horarios",
                table: "agendaveterinario");

            migrationBuilder.AddColumn<int>(
                name: "origemsolicitacao",
                table: "agendamentoconsulta",
                type: "integer",
                nullable: false,
                defaultValue: 1);

            migrationBuilder.Sql(
                "UPDATE agendaveterinario SET horainiciomanha = INTERVAL '08:00:00', horafimmanha = INTERVAL '11:00:00', horainiciotarde = INTERVAL '13:00:00', horafimtarde = INTERVAL '17:00:00'");

            migrationBuilder.AddCheckConstraint(
                name: "CK_agendamentoconsulta_origem",
                table: "agendamentoconsulta",
                sql: "origemsolicitacao IN (1, 2)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_agendaveterinario_horarios",
                table: "agendaveterinario",
                sql: "horainiciomanha = INTERVAL '08:00:00' AND horafimmanha = INTERVAL '11:00:00' AND horainiciotarde = INTERVAL '13:00:00' AND horafimtarde = INTERVAL '17:00:00'");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_agendamentoconsulta_origem",
                table: "agendamentoconsulta");

            migrationBuilder.DropCheckConstraint(
                name: "CK_agendaveterinario_horarios",
                table: "agendaveterinario");

            migrationBuilder.DropColumn(
                name: "origemsolicitacao",
                table: "agendamentoconsulta");

            migrationBuilder.AddCheckConstraint(
                name: "CK_agendaveterinario_horarios",
                table: "agendaveterinario",
                sql: "horainiciomanha < horafimmanha AND horainiciotarde < horafimtarde");
        }
    }
}
