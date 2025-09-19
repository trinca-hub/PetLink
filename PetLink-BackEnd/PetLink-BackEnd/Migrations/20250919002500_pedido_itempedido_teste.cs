using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PetLink_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class pedido_itempedido_teste : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "administrador",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    senha = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    status = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_administrador", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "produto",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    preco = table.Column<float>(type: "real", nullable: false),
                    descricao = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    quantidade = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_produto", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "usuario",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    telefone = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: false),
                    cep = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    uf = table.Column<string>(type: "text", nullable: false),
                    cidade = table.Column<string>(type: "text", nullable: false),
                    bairro = table.Column<string>(type: "text", nullable: false),
                    rua = table.Column<string>(type: "text", nullable: false),
                    numero = table.Column<int>(type: "integer", nullable: false),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    senha = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuario", x => x.id);
                });

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

            migrationBuilder.CreateTable(
                name: "pedido",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    usuarioid = table.Column<int>(type: "integer", nullable: false),
                    datapedido = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pedido", x => x.id);
                    table.ForeignKey(
                        name: "FK_pedido_usuario_usuarioid",
                        column: x => x.usuarioid,
                        principalTable: "usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "itempedido",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    pedidoid = table.Column<int>(type: "integer", nullable: false),
                    produtoid = table.Column<int>(type: "integer", nullable: false),
                    quantidade = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_itempedido", x => x.id);
                    table.ForeignKey(
                        name: "FK_itempedido_pedido_pedidoid",
                        column: x => x.pedidoid,
                        principalTable: "pedido",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_itempedido_produto_produtoid",
                        column: x => x.produtoid,
                        principalTable: "produto",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "administrador",
                columns: new[] { "id", "email", "nome", "senha", "status" },
                values: new object[,]
                {
                    { 1, "miguelsilva@gmail.com", "Miguel Silva", "123456", 1 },
                    { 2, "gabrieloliveira@gmail.com", "Gabriel Oliveira", "abcdefg", 1 },
                    { 3, "marcobrito@gmail.com", "Marco Brito", "aaaaaaa", 2 }
                });

            migrationBuilder.InsertData(
                table: "produto",
                columns: new[] { "id", "descricao", "nome", "preco", "quantidade" },
                values: new object[,]
                {
                    { 1, "Ração Pedigree 500 gramas", "Ração 500g", 10f, 10 },
                    { 2, "Petisco de Palito sabor bacon", "Petisco de Bacon", 11f, 15 }
                });

            migrationBuilder.InsertData(
                table: "usuario",
                columns: new[] { "id", "bairro", "cep", "cidade", "email", "nome", "numero", "rua", "senha", "telefone", "uf" },
                values: new object[,]
                {
                    { 1, "Clone", "15790000", "Rubineia", "gabriel@gmail.com", "Gabriel", 1, "Rua dos Guerreiros", "pokemon12", "179999999", "São Paulo" },
                    { 2, "NSF", "15761006", "Urânia", "enzo@gmail.com", "Enzo", 69, "Travessia dos nóia", "123456", "17997938925", "São Paulo" },
                    { 3, "Centro", "15761396", "Dolcinópolis", "yasmin@gmail.com", "Yasmin", 777, "Aquela rua lá", "fatecjales", "17997921343", "São Paulo" }
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

            migrationBuilder.InsertData(
                table: "pedido",
                columns: new[] { "id", "datapedido", "usuarioid" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 9, 18, 10, 20, 32, 0, DateTimeKind.Utc), 1 },
                    { 2, new DateTime(2025, 9, 18, 10, 20, 32, 0, DateTimeKind.Utc), 2 }
                });

            migrationBuilder.InsertData(
                table: "itempedido",
                columns: new[] { "id", "pedidoid", "produtoid", "quantidade" },
                values: new object[,]
                {
                    { 1, 1, 1, 10 },
                    { 2, 2, 2, 5 }
                });

            migrationBuilder.CreateIndex(
                name: "IX_itempedido_pedidoid",
                table: "itempedido",
                column: "pedidoid");

            migrationBuilder.CreateIndex(
                name: "IX_itempedido_produtoid",
                table: "itempedido",
                column: "produtoid");

            migrationBuilder.CreateIndex(
                name: "IX_pedido_usuarioid",
                table: "pedido",
                column: "usuarioid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "administrador");

            migrationBuilder.DropTable(
                name: "itempedido");

            migrationBuilder.DropTable(
                name: "veterinario");

            migrationBuilder.DropTable(
                name: "pedido");

            migrationBuilder.DropTable(
                name: "produto");

            migrationBuilder.DropTable(
                name: "usuario");
        }
    }
}
