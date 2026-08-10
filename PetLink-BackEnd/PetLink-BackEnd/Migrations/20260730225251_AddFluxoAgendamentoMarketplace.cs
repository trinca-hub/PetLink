using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PetLink_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class AddFluxoAgendamentoMarketplace : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_agendamentoconsulta_status_pendente",
                table: "agendamentoconsulta");

            migrationBuilder.AddColumn<DateTime>(
                name: "datarecusa",
                table: "agendamentoconsulta",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "dataultimaremarcacao",
                table: "agendamentoconsulta",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "motivorecusa",
                table: "agendamentoconsulta",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "motivoremarcacao",
                table: "agendamentoconsulta",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "agendaslotbloqueado",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    veterinarioid = table.Column<int>(type: "integer", nullable: false),
                    datahorainicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    motivo = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: true),
                    datacriacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agendaslotbloqueado", x => x.id);
                    table.ForeignKey(
                        name: "FK_agendaslotbloqueado_veterinario_veterinarioid",
                        column: x => x.veterinarioid,
                        principalTable: "veterinario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_agendaslotbloqueado_veterinarioid_datahorainicio",
                table: "agendaslotbloqueado",
                columns: new[] { "veterinarioid", "datahorainicio" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "agendaslotbloqueado");

            migrationBuilder.DropColumn(
                name: "datarecusa",
                table: "agendamentoconsulta");

            migrationBuilder.DropColumn(
                name: "dataultimaremarcacao",
                table: "agendamentoconsulta");

            migrationBuilder.DropColumn(
                name: "motivorecusa",
                table: "agendamentoconsulta");

            migrationBuilder.DropColumn(
                name: "motivoremarcacao",
                table: "agendamentoconsulta");

            migrationBuilder.AddCheckConstraint(
                name: "CK_agendamentoconsulta_status_pendente",
                table: "agendamentoconsulta",
                sql: "(status <> 1 OR (datahorainicio IS NULL AND datahorafim IS NULL))");
        }
    }
}
