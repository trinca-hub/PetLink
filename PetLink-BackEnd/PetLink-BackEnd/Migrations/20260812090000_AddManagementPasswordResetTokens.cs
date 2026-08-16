using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using PetLink_BackEnd.Data;

#nullable disable

namespace PetLink_BackEnd.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260812090000_AddManagementPasswordResetTokens")]
public partial class AddManagementPasswordResetTokens : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(name: "token_redefinicao_senha_gestao", columns: table => new
        {
            id = table.Column<int>(type: "integer", nullable: false).Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
            perfil = table.Column<string>(type: "text", nullable: false), email = table.Column<string>(type: "text", nullable: false),
            token_hash = table.Column<string>(type: "text", nullable: false), expira_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false), usado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
        }, constraints: table => table.PrimaryKey("PK_token_redefinicao_senha_gestao", x => x.id));
        migrationBuilder.CreateIndex(name: "IX_token_redefinicao_senha_gestao_perfil_email_token_hash", table: "token_redefinicao_senha_gestao", columns: new[] { "perfil", "email", "token_hash" }, unique: true);
    }
    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DropTable(name: "token_redefinicao_senha_gestao");
}
