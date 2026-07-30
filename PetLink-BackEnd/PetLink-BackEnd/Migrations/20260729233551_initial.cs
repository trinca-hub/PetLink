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
                name: "funcionario",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    senha = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    salario = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_funcionario", x => x.id);
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
                    foto = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
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
                    senha = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
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
                    idade = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
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
                name: "agendaveterinario",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    veterinarioid = table.Column<int>(type: "integer", nullable: false),
                    diassemanaativos = table.Column<int>(type: "integer", nullable: false),
                    horainiciomanha = table.Column<TimeSpan>(type: "interval", nullable: false),
                    horafimmanha = table.Column<TimeSpan>(type: "interval", nullable: false),
                    horainiciotarde = table.Column<TimeSpan>(type: "interval", nullable: false),
                    horafimtarde = table.Column<TimeSpan>(type: "interval", nullable: false),
                    duracaominutos = table.Column<int>(type: "integer", nullable: false),
                    datacriacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agendaveterinario", x => x.id);
                    table.CheckConstraint("CK_agendaveterinario_dias", "diassemanaativos > 0");
                    table.CheckConstraint("CK_agendaveterinario_duracao", "duracaominutos = 60");
                    table.CheckConstraint("CK_agendaveterinario_horarios", "horainiciomanha < horafimmanha AND horainiciotarde < horafimtarde");
                    table.ForeignKey(
                        name: "FK_agendaveterinario_veterinario_veterinarioid",
                        column: x => x.veterinarioid,
                        principalTable: "veterinario",
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
                name: "agendamentoconsulta",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    veterinarioid = table.Column<int>(type: "integer", nullable: false),
                    petid = table.Column<int>(type: "integer", nullable: false),
                    usuarioid = table.Column<int>(type: "integer", nullable: false),
                    datahorainicio = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    datahorafim = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    status = table.Column<int>(type: "integer", nullable: false),
                    tiposervico = table.Column<int>(type: "integer", nullable: false),
                    observacao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    motivocancelamento = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    datacriacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    dataconfirmacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    datacancelamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    rowversion = table.Column<byte[]>(type: "bytea", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_agendamentoconsulta", x => x.id);
                    table.CheckConstraint("CK_agendamentoconsulta_horario", "(datahorainicio IS NULL AND datahorafim IS NULL) OR (datahorainicio < datahorafim)");
                    table.CheckConstraint("CK_agendamentoconsulta_status_datas", "(status <> 2 OR dataconfirmacao IS NOT NULL) AND (status <> 3 OR datacancelamento IS NOT NULL)");
                    table.CheckConstraint("CK_agendamentoconsulta_status_pendente", "(status <> 1 OR (datahorainicio IS NULL AND datahorafim IS NULL))");
                    table.ForeignKey(
                        name: "FK_agendamentoconsulta_pet_petid",
                        column: x => x.petid,
                        principalTable: "pet",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_agendamentoconsulta_usuario_usuarioid",
                        column: x => x.usuarioid,
                        principalTable: "usuario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_agendamentoconsulta_veterinario_veterinarioid",
                        column: x => x.veterinarioid,
                        principalTable: "veterinario",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
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
                    { 1, "miguelsilva@gmail.com", "Miguel Silva", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", 1 },
                    { 2, "gabrieloliveira@gmail.com", "Gabriel Oliveira", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", 1 },
                    { 3, "marcobrito@gmail.com", "Marco Brito", "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", 2 }
                });

            migrationBuilder.InsertData(
                table: "funcionario",
                columns: new[] { "id", "email", "nome", "salario", "senha" },
                values: new object[,]
                {
                    { 1, "funcionario1@petlink.com", "Funcionario 1", 2500.00m, "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" },
                    { 2, "funcionario2@petlink.com", "Funcionario 2", 3200.00m, "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" },
                    { 3, "funcionario3@petlink.com", "Funcionario 3", 4100.00m, "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" }
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
                columns: new[] { "id", "crmv", "email", "nome", "salario", "senha", "status" },
                values: new object[,]
                {
                    { 1, "4750", "gabriel@gmail.com", "Gabriel", 100000f, "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", 2 },
                    { 2, "7452", "enzo@gmail.com", "Enzo", 100000f, "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", 1 },
                    { 3, "0001", "yasmin@gmail.com", "Yasmin", 100000f, "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92", 1 }
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
                    { 1, false, "https://www.prodograw.com/wp-content/uploads/2025/09/American-Pitbull-1-800x800.jpg", "7 anos", "Peroba", 35.3f, "Pit Bull", "22992", "Macho", 2, 1 },
                    { 2, true, "https://images.tcdn.com.br/img/img_prod/1087789/noticia_619419434679a87734bc0e.png", "3 anos", "Felipina", 5.5f, "Yorkshire", "22392", "Fêmea", 2, 2 },
                    { 3, false, "https://imgs.search.brave.com/Zf7U4EzVoIouXr_8pci0FiteQUnpCBmJF6NO38G0qdo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvNDcy/NDY3OTUyL3B0L2Zv/dG8vYyVDMyVBM28t/cGFzdG9yLWFsZW0l/QzMlQTNvLWNhY2hv/cnJpbmhvLXRyaXN0/ZS1jJUMzJUEzby1k/ZWl0YWRvLW9saGFu/ZG8uanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPS0xV1NNYmtr/RzV1RTg5SnBPQ2NF/eU1PUllZalAxMUZP/ZzNQNWE4WXBMOXM9", "8 meses", "Neguin", 14.9f, "Pastor Alemão", "22192", "Macho", 2, 3 },
                    { 4, true, "https://imgs.search.brave.com/OiTS8j_7NOegyditO95P5Iw58RfR0yv__Gohg9GgVe4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pbWcu/ZnJlZXBpay5jb20v/Zm90b3MtZ3JhdGlz/L3JldHJhdG8tZWxl/Z2FudGUtZGUtdW0t/Z2F0by1zaWFtZXNf/MjMtMjE1MTk4MzU0/NC5qcGc_c2VtdD1h/aXNfaHlicmlkJnc9/NzQwJnE9ODA", "8 anos", "Garfield", 5.3f, "Siamês", "22992", "Macho", 1, 1 },
                    { 5, true, "https://imgs.search.brave.com/1uVQa0yKTFnW7bqkIzG0jlsP8yOKb1kqLWWaIUFm5NM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4w/LmV4cGVydG9hbmlt/YWwuY29tL2VzL3Jh/emFzLzQvOC8xL2dh/dG8tcmFnZG9sbF8x/ODRfNl9vcmlnLmpw/Zw", "6 meses", "Tom", 2.5f, "Ragdoll", "43432", "Macho", 1, 2 },
                    { 6, true, "https://imgs.search.brave.com/V0Na41tb7sTCIIeoRfAtv2KeDyLqOm3kiFDn7jKBwHo/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5pc3RvY2twaG90/by5jb20vaWQvMTE4/OTk3NDk1MC9waG90/by9tYWluZS1jb29u/LWNhdC1jbG9zZS11/cC1mdW5ueS1jdXRl/LWNhdC13aXRoLW1h/cmJsZS1mdXItY29s/b3ItbGFyZ2VzdC1k/b21lc3RpY2F0ZWQt/YnJlZWRzLW9mLmpw/Zz9zPTYxMng2MTIm/dz0wJms9MjAmYz16/djAzeG1iLVdFR2hE/YkNhZFRid3Z3SUxQ/N3ZwS01KTDF5eEY4/MjFhWXJJPQ", "3 anos", "Marie", 3.2f, "Coon", "22192", "Fêmea", 1, 3 }
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
                name: "IX_agendamentoconsulta_pendente",
                table: "agendamentoconsulta",
                columns: new[] { "veterinarioid", "petid", "usuarioid", "status" });

            migrationBuilder.CreateIndex(
                name: "IX_agendamentoconsulta_petid",
                table: "agendamentoconsulta",
                column: "petid");

            migrationBuilder.CreateIndex(
                name: "IX_agendamentoconsulta_usuarioid",
                table: "agendamentoconsulta",
                column: "usuarioid");

            migrationBuilder.CreateIndex(
                name: "IX_agendamentoconsulta_vet_horario",
                table: "agendamentoconsulta",
                columns: new[] { "veterinarioid", "datahorainicio", "datahorafim" });

            migrationBuilder.CreateIndex(
                name: "IX_agendamentoconsulta_vet_inicio",
                table: "agendamentoconsulta",
                columns: new[] { "veterinarioid", "datahorainicio" });

            migrationBuilder.CreateIndex(
                name: "IX_agendaveterinario_veterinarioid",
                table: "agendaveterinario",
                column: "veterinarioid",
                unique: true);

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
                name: "IX_funcionario_email",
                table: "funcionario",
                column: "email",
                unique: true);

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
                name: "agendamentoconsulta");

            migrationBuilder.DropTable(
                name: "agendaveterinario");

            migrationBuilder.DropTable(
                name: "anuncio_paypet");

            migrationBuilder.DropTable(
                name: "anuncio_petfinder");

            migrationBuilder.DropTable(
                name: "anuncio_petinder");

            migrationBuilder.DropTable(
                name: "funcionario");

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
