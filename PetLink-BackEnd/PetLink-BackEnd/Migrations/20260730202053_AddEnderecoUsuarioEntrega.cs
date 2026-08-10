using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace PetLink_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class AddEnderecoUsuarioEntrega : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "enderecousuarioid",
                table: "pedido",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "enderecousuario",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    usuarioid = table.Column<int>(type: "integer", nullable: false),
                    apelido = table.Column<string>(type: "character varying(60)", maxLength: 60, nullable: false),
                    destinatario = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    telefone = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    cep = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    uf = table.Column<string>(type: "character varying(2)", maxLength: 2, nullable: false),
                    cidade = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    bairro = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    rua = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    numero = table.Column<int>(type: "integer", nullable: false),
                    complemento = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    referencia = table.Column<string>(type: "character varying(140)", maxLength: 140, nullable: false),
                    principal = table.Column<bool>(type: "boolean", nullable: false),
                    ativo = table.Column<bool>(type: "boolean", nullable: false),
                    criadoem = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_enderecousuario", x => x.id);
                    table.ForeignKey(
                        name: "FK_enderecousuario_usuario_usuarioid",
                        column: x => x.usuarioid,
                        principalTable: "usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "pedido",
                keyColumn: "id",
                keyValue: 1,
                column: "enderecousuarioid",
                value: null);

            migrationBuilder.UpdateData(
                table: "pedido",
                keyColumn: "id",
                keyValue: 2,
                column: "enderecousuarioid",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_pedido_enderecousuarioid",
                table: "pedido",
                column: "enderecousuarioid");

            migrationBuilder.CreateIndex(
                name: "IX_enderecousuario_usuarioid_principal",
                table: "enderecousuario",
                columns: new[] { "usuarioid", "principal" });

            migrationBuilder.AddForeignKey(
                name: "FK_pedido_enderecousuario_enderecousuarioid",
                table: "pedido",
                column: "enderecousuarioid",
                principalTable: "enderecousuario",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_pedido_enderecousuario_enderecousuarioid",
                table: "pedido");

            migrationBuilder.DropTable(
                name: "enderecousuario");

            migrationBuilder.DropIndex(
                name: "IX_pedido_enderecousuarioid",
                table: "pedido");

            migrationBuilder.DropColumn(
                name: "enderecousuarioid",
                table: "pedido");
        }
    }
}
