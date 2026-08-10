using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using PetLink_BackEnd.Data;

#nullable disable

namespace PetLink_BackEnd.Migrations;

[DbContext(typeof(AppDbContext))]
[Migration("20260810180000_AddPasswordResetTokens")]
public partial class AddPasswordResetTokens : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "token_redefinicao_senha",
            columns: table => new
            {
                id = table.Column<int>(type: "integer", nullable: false).Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                usuario_id = table.Column<int>(type: "integer", nullable: false),
                token_hash = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                expira_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                usado_em = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_token_redefinicao_senha", x => x.id);
                table.ForeignKey("FK_token_redefinicao_senha_usuario_usuario_id", x => x.usuario_id, "usuario", "id", onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateIndex(name: "IX_token_redefinicao_senha_token_hash", table: "token_redefinicao_senha", column: "token_hash", unique: true);
        migrationBuilder.CreateIndex(name: "IX_token_redefinicao_senha_usuario_id", table: "token_redefinicao_senha", column: "usuario_id");
    }

    protected override void Down(MigrationBuilder migrationBuilder) => migrationBuilder.DropTable(name: "token_redefinicao_senha");
}
