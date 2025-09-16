using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PetLink_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class teste : Migration
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "administrador");

            migrationBuilder.DropTable(
                name: "produto");

            migrationBuilder.DropTable(
                name: "usuario");
        }
    }
}
