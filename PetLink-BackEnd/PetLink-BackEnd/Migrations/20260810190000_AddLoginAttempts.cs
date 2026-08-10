using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using PetLink_BackEnd.Data;

#nullable disable

namespace PetLink_BackEnd.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260810190000_AddLoginAttempts")]
public partial class AddLoginAttempts : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "tentativa_login",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false).Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                ip = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                falhas = table.Column<int>(type: "integer", nullable: false),
                bloqueado_ate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                atualizado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
            },
            constraints: table => table.PrimaryKey("PK_tentativa_login", x => x.id));

        migrationBuilder.CreateIndex(
            name: "IX_tentativa_login_email_ip",
            table: "tentativa_login",
            columns: new[] { "email", "ip" },
            unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DropTable(name: "tentativa_login");
}
