using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PetLink_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class CorrigeFusoHorarioAgenda : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Os horários antigos foram gerados como se a hora local de São Paulo
            // já fosse UTC. Corrige os registros existentes para o instante UTC
            // equivalente, mantendo a hora exibida originalmente pretendida.
            migrationBuilder.Sql(
                """
                UPDATE agendamentoconsulta
                SET datahorainicio = datahorainicio + INTERVAL '3 hours',
                    datahorafim = datahorafim + INTERVAL '3 hours'
                WHERE datahorainicio IS NOT NULL
                  AND datahorafim IS NOT NULL;
                """);

            migrationBuilder.Sql(
                """
                UPDATE agendaslotbloqueado
                SET datahorainicio = datahorainicio + INTERVAL '3 hours';
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                UPDATE agendamentoconsulta
                SET datahorainicio = datahorainicio - INTERVAL '3 hours',
                    datahorafim = datahorafim - INTERVAL '3 hours'
                WHERE datahorainicio IS NOT NULL
                  AND datahorafim IS NOT NULL;
                """);

            migrationBuilder.Sql(
                """
                UPDATE agendaslotbloqueado
                SET datahorainicio = datahorainicio - INTERVAL '3 hours';
                """);
        }
    }
}
