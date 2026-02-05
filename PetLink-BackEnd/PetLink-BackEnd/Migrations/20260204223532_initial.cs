using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace PetLink_BackEnd.Migrations
{
    /// <inheritdoc />
    public partial class initial : Migration
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
                    quantidade = table.Column<int>(type: "integer", nullable: false),
                    foto = table.Column<string>(type: "text", nullable: true)
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
                name: "anuncio",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    descricao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    tipoanuncio = table.Column<int>(type: "integer", nullable: false),
                    datacriacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    criadortipo = table.Column<int>(type: "integer", nullable: false),
                    criadorid = table.Column<int>(type: "integer", nullable: false),
                    origemendereco = table.Column<int>(type: "integer", nullable: false),
                    usuarioid = table.Column<int>(type: "integer", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_anuncio", x => x.id);
                    table.ForeignKey(
                        name: "FK_anuncio_usuario_usuarioid",
                        column: x => x.usuarioid,
                        principalTable: "usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
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
                name: "pet",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    raca = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    sexo = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    rga = table.Column<string>(type: "character varying(7)", maxLength: 7, nullable: false),
                    idade = table.Column<int>(type: "integer", nullable: false),
                    foto = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    peso = table.Column<float>(type: "real", nullable: false),
                    castrado = table.Column<bool>(type: "boolean", nullable: false),
                    tipopet = table.Column<int>(type: "integer", nullable: false),
                    usuarioid = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_pet", x => x.id);
                    table.ForeignKey(
                        name: "FK_pet_usuario_usuarioid",
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

            migrationBuilder.CreateTable(
                name: "anuncio_paypet",
                columns: table => new
                {
                    anuncioid = table.Column<int>(type: "integer", nullable: false),
                    petid = table.Column<int>(type: "integer", nullable: false),
                    tipopaypet = table.Column<int>(type: "integer", nullable: false),
                    valor = table.Column<decimal>(type: "numeric", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_anuncio_paypet", x => x.anuncioid);
                    table.ForeignKey(
                        name: "FK_anuncio_paypet_anuncio_anuncioid",
                        column: x => x.anuncioid,
                        principalTable: "anuncio",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_anuncio_paypet_pet_petid",
                        column: x => x.petid,
                        principalTable: "pet",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "anuncio_petfinder",
                columns: table => new
                {
                    anuncioid = table.Column<int>(type: "integer", nullable: false),
                    petid = table.Column<int>(type: "integer", nullable: false),
                    ultimolocalvisto = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    datadesaparecimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_anuncio_petfinder", x => x.anuncioid);
                    table.ForeignKey(
                        name: "FK_anuncio_petfinder_anuncio_anuncioid",
                        column: x => x.anuncioid,
                        principalTable: "anuncio",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_anuncio_petfinder_pet_petid",
                        column: x => x.petid,
                        principalTable: "pet",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "anuncio_petinder",
                columns: table => new
                {
                    anuncioid = table.Column<int>(type: "integer", nullable: false),
                    petid = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_anuncio_petinder", x => x.anuncioid);
                    table.ForeignKey(
                        name: "FK_anuncio_petinder_anuncio_anuncioid",
                        column: x => x.anuncioid,
                        principalTable: "anuncio",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_anuncio_petinder_pet_petid",
                        column: x => x.petid,
                        principalTable: "pet",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "servico",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    dataServico = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    descricao = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    tipo = table.Column<int>(type: "integer", nullable: false),
                    valor = table.Column<float>(type: "real", nullable: false),
                    petid = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_servico", x => x.id);
                    table.ForeignKey(
                        name: "FK_servico_pet_petid",
                        column: x => x.petid,
                        principalTable: "pet",
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
                columns: new[] { "id", "descricao", "foto", "nome", "preco", "quantidade" },
                values: new object[,]
                {
                    { 1, "Ração Pedigree 500 gramas", "https://imgs.search.brave.com/r1PNHaYGnd3HRBoNFQeFO3bRfx1uCwlGuwVT1mok0qo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9odHRw/Mi5tbHN0YXRpYy5j/b20vRF9RX05QXzJY/XzYzNjExOC1NTEE5/OTM1MDQ0MDgzOF8x/MTIwMjUtRS53ZWJw", "Ração 500g", 10f, 10 },
                    { 2, "Petisco de Palito sabor bacon", "https://imgs.search.brave.com/FKsGy9GxYXivL93X8J04VdbB87o_OqbnYrQk472t9P8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tLm1l/ZGlhLWFtYXpvbi5j/b20vaW1hZ2VzL0kv/NDFvU0xsLU5jZkwu/anBn", "Petisco de Bacon", 11f, 15 }
                });

            migrationBuilder.InsertData(
                table: "usuario",
                columns: new[] { "id", "bairro", "cep", "cidade", "email", "nome", "numero", "rua", "senha", "telefone", "uf" },
                values: new object[,]
                {
                    { 1, "Clone", "15790000", "Rubineia", "gabriel@gmail.com", "Gabriel", 1, "Rua dos Guerreiros", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", "179999999", "São Paulo" },
                    { 2, "NSF", "15761006", "Urânia", "enzo@gmail.com", "Enzo", 69, "Travessia dos nóia", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", "17997938925", "São Paulo" },
                    { 3, "Centro", "15761396", "Dolcinópolis", "yasmin@gmail.com", "Yasmin", 777, "Aquela rua lá", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", "17997921343", "São Paulo" }
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
                table: "pet",
                columns: new[] { "id", "castrado", "foto", "idade", "nome", "peso", "raca", "rga", "sexo", "tipopet", "usuarioid" },
                values: new object[,]
                {
                    { 1, false, "https://www.prodograw.com/wp-content/uploads/2025/09/American-Pitbull-1-800x800.jpg", 12, "Peroba", 35.3f, "Pit Bull", "22992", "Masculino", 2, 1 },
                    { 2, true, "https://images.tcdn.com.br/img/img_prod/1087789/noticia_619419434679a87734bc0e.png", 5, "Felipina", 5.5f, "Yorkshire", "22392", "Fêmea", 1, 2 },
                    { 3, false, "https://objectstorage.sa-vinhedo-1.oraclecloud.com/n/axuh3s32sabm/b/cobasi-institutional-cms-bucket/o/prod/Pastor%202.jpg", 24, "Neguin", 30.9f, "Pastor Alemão", "22192", "Masculino", 2, 3 }
                });

            migrationBuilder.InsertData(
                table: "itempedido",
                columns: new[] { "id", "pedidoid", "produtoid", "quantidade" },
                values: new object[,]
                {
                    { 1, 1, 1, 10 },
                    { 2, 2, 2, 5 }
                });

            migrationBuilder.InsertData(
                table: "servico",
                columns: new[] { "id", "dataServico", "descricao", "petid", "tipo", "valor" },
                values: new object[,]
                {
                    { 1, new DateTime(2025, 10, 15, 0, 28, 32, 0, DateTimeKind.Utc), "Consulta do Joquinha", 1, 1, 100f },
                    { 2, new DateTime(2025, 9, 18, 15, 20, 22, 0, DateTimeKind.Utc), "Banho da Macoca", 2, 2, 60f },
                    { 3, new DateTime(2025, 6, 27, 10, 47, 2, 0, DateTimeKind.Utc), "Tosa da Penelope", 3, 3, 80f }
                });

            migrationBuilder.CreateIndex(
                name: "IX_anuncio_usuarioid",
                table: "anuncio",
                column: "usuarioid");

            migrationBuilder.CreateIndex(
                name: "IX_anuncio_paypet_petid",
                table: "anuncio_paypet",
                column: "petid");

            migrationBuilder.CreateIndex(
                name: "IX_anuncio_petfinder_petid",
                table: "anuncio_petfinder",
                column: "petid");

            migrationBuilder.CreateIndex(
                name: "IX_anuncio_petinder_petid",
                table: "anuncio_petinder",
                column: "petid");

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

            migrationBuilder.CreateIndex(
                name: "IX_pet_usuarioid",
                table: "pet",
                column: "usuarioid");

            migrationBuilder.CreateIndex(
                name: "IX_servico_petid",
                table: "servico",
                column: "petid");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "administrador");

            migrationBuilder.DropTable(
                name: "anuncio_paypet");

            migrationBuilder.DropTable(
                name: "anuncio_petfinder");

            migrationBuilder.DropTable(
                name: "anuncio_petinder");

            migrationBuilder.DropTable(
                name: "itempedido");

            migrationBuilder.DropTable(
                name: "servico");

            migrationBuilder.DropTable(
                name: "veterinario");

            migrationBuilder.DropTable(
                name: "anuncio");

            migrationBuilder.DropTable(
                name: "pedido");

            migrationBuilder.DropTable(
                name: "produto");

            migrationBuilder.DropTable(
                name: "pet");

            migrationBuilder.DropTable(
                name: "usuario");
        }
    }
}
