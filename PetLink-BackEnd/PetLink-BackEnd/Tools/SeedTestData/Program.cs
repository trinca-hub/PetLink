using Npgsql;
using System.Security.Cryptography;

const string defaultConnection =
    "Host=localhost;Port=5432;Database=PetLinkBD;Username=postgres;Password=123456;";

var connectionString = args.FirstOrDefault()
    ?? Environment.GetEnvironmentVariable("PETLINK_CONNECTION_STRING")
    ?? defaultConnection;

const string passwordHash123456 =
    "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92";
const string enzoEmail = "enzo.stafuza@gmail.com";
const string enzoPassword = "100715Ess";

static string HashPassword(string password)
{
    const int iterations = 600_000;
    const int saltSize = 16;
    const int hashSize = 32;

    var salt = RandomNumberGenerator.GetBytes(saltSize);
    var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, hashSize);
    return $"PBKDF2${iterations}${Convert.ToBase64String(salt)}${Convert.ToBase64String(hash)}";
}

var enzoPasswordHash = HashPassword(enzoPassword);

var sql = $$"""
BEGIN;

INSERT INTO usuario (id, nome, telefone, cep, uf, cidade, bairro, rua, numero, email, senha)
VALUES
  (1, 'Gabriel Trinca', '17999990001', '15700001', 'SP', 'Sao Paulo', 'Centro', 'Rua Ametista', 101, 'gabriel@gmail.com', '{{passwordHash123456}}'),
  (2, 'Enzo Stafuza', '17999990002', '15700002', 'SP', 'Campinas', 'Cambuí', 'Rua das Flores', 202, 'enzo@gmail.com', '{{passwordHash123456}}'),
  (3, 'Yasmin Basso', '17999990003', '15700003', 'SP', 'Santos', 'Gonzaga', 'Avenida Praia', 303, 'yasmin@gmail.com', '{{passwordHash123456}}'),
  (4, 'Lara Almeida', '17999990004', '15700004', 'SP', 'Ribeirao Preto', 'Jardim Paulista', 'Rua Cedro', 404, 'lara@gmail.com', '{{passwordHash123456}}'),
  (5, 'Mateus Lima', '17999990005', '15700005', 'SP', 'Jundiai', 'Vila Arens', 'Rua Ipê', 505, 'mateus@gmail.com', '{{passwordHash123456}}'),
  (6, 'Enzo Stafuza', '17999990006', '15700006', 'SP', 'Urânia', 'Centro', 'Rua das Flores', 6, '{{enzoEmail}}', '{{enzoPasswordHash}}')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome, telefone = EXCLUDED.telefone, cep = EXCLUDED.cep, uf = EXCLUDED.uf,
  cidade = EXCLUDED.cidade, bairro = EXCLUDED.bairro, rua = EXCLUDED.rua, numero = EXCLUDED.numero,
  email = EXCLUDED.email, senha = EXCLUDED.senha;

INSERT INTO funcionario (id, nome, email, senha, salario)
VALUES
  (1, 'Gabriel Funcionário', 'gabriel@gmail.com', '{{passwordHash123456}}', 2800.00),
  (2, 'Enzo Funcionário', 'enzo@gmail.com', '{{passwordHash123456}}', 3200.00),
  (3, 'Yasmin Funcionária', 'yasmin@gmail.com', '{{passwordHash123456}}', 3500.00),
  (4, 'Lara Funcionária', 'lara.func@gmail.com', '{{passwordHash123456}}', 3000.00),
  (5, 'Mateus Funcionário', 'mateus.func@gmail.com', '{{passwordHash123456}}', 4100.00),
  (6, 'Enzo Stafuza', '{{enzoEmail}}', '{{enzoPasswordHash}}', 3500.00)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome, email = EXCLUDED.email, senha = EXCLUDED.senha, salario = EXCLUDED.salario;

INSERT INTO administrador (id, nome, email, senha, status)
VALUES
  (1, 'Gabriel Administrador', 'gabriel@gmail.com', '{{passwordHash123456}}', 1),
  (2, 'Enzo Administrador', 'enzo@gmail.com', '{{passwordHash123456}}', 1),
  (3, 'Yasmin Administradora', 'yasmin@gmail.com', '{{passwordHash123456}}', 1),
  (4, 'Lara Administradora', 'lara.adm@gmail.com', '{{passwordHash123456}}', 1),
  (5, 'Mateus Administrador', 'mateus.adm@gmail.com', '{{passwordHash123456}}', 2),
  (6, 'Enzo Stafuza', '{{enzoEmail}}', '{{enzoPasswordHash}}', 1)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome, email = EXCLUDED.email, senha = EXCLUDED.senha, status = EXCLUDED.status;

INSERT INTO veterinario (id, nome, crmv, salario, email, senha, status)
VALUES
  (1, 'Gabriel Veterinário', 'CRMV-SP-1001', 7200.00, 'gabriel@gmail.com', '{{passwordHash123456}}', 1),
  (2, 'Enzo Veterinário', 'CRMV-SP-1002', 7600.00, 'enzo@gmail.com', '{{passwordHash123456}}', 1),
  (3, 'Yasmin Veterinária', 'CRMV-SP-1003', 7900.00, 'yasmin@gmail.com', '{{passwordHash123456}}', 1),
  (4, 'Lara Veterinária', 'CRMV-SP-1004', 6800.00, 'lara.vet@gmail.com', '{{passwordHash123456}}', 1),
  (5, 'Mateus Veterinário', 'CRMV-SP-1005', 6500.00, 'mateus.vet@gmail.com', '{{passwordHash123456}}', 2),
  (6, 'Enzo Stafuza', 'CRMV-SP-1006', 8000.00, '{{enzoEmail}}', '{{enzoPasswordHash}}', 1)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome, crmv = EXCLUDED.crmv, salario = EXCLUDED.salario,
  email = EXCLUDED.email, senha = EXCLUDED.senha, status = EXCLUDED.status;

INSERT INTO produto (id, nome, preco, descricao, quantidade, foto)
VALUES
  (1, 'Ração Premium Cães 1kg', 32.90, 'Ração seca premium para cães adultos.', 25, 'https://imgs.search.brave.com/fGca32DQei0ouMCtJULMqaJgFd8tnUHD1iXSHhUwLY4/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9hLXN0/YXRpYy5tbGNkbi5j/b20uYnIvMjgweDIx/MC9yYWNhby1xdWF0/cmVlLXN1cHJlbWUt/Y2Flcy1zZW5pb3It/Ny1yYWNhcy1wZXF1/ZW5hcy1mcmFuZ28t/ZS1zYWxtYW8tMTAx/a2cvdHVkb2RlYmlj/aG9paS8xMTc3Mjcv/MDM4N2E2YmFjYzNi/MmMzYTJlODlhOTdl/NTUzYTI1ZGQuanBl/Zw'),
  (2, 'Areia Higiênica 4kg', 24.50, 'Areia granulada para gatos com controle de odor.', 18, 'https://cobasi.vteximg.com.br/arquivos/ids/1064171-170-170/Areia-Higienica-Biodegradavel-Graos-Mistos-Viva-Verde-4kg-1.png?v=638681447909000000'),
  (3, 'Petisco Dental', 15.90, 'Petisco para higiene bucal de cães.', 40, 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcR2KqC7rORVUBlIqQGN1VPIDVNaST5EgeokWwFDUDVTkRTdb60mC1CEwzCrBramr7ncYHQQShUHrV0wpT98uBJw7ZreyZPBYU3MzdxxwVErP5ac1nWE85GBRvM'),
  (4, 'Coleira Ajustável', 29.90, 'Coleira confortável com ajuste rápido.', 12, 'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQTSULP69uUnWW55YKrikljwSWlgx0QCMHh7RMrMT_zTPLUNijjJicIDn0gG4RM1Rz1OE2OVSow6S7gFQDdcUppkSm_KRBC3Y8i5zzbRae8rp4zdWQNOxtAFQ'),
  (5, 'Shampoo Neutro Pet', 22.00, 'Shampoo neutro para banho de cães e gatos.', 30, 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTZwzj_UwuFWmBG_8GLHgEYj7oMFz3SuUGalDrH6FThfTZRd147y0A7vNnxxgDjooTUc2b6Bf7wontRG3W1AAqwGw23YhTuAzNHRYBFlgM1T4QMZnNrF3x9')
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome, preco = EXCLUDED.preco, descricao = EXCLUDED.descricao,
  quantidade = EXCLUDED.quantidade, foto = EXCLUDED.foto;

INSERT INTO pet (id, nome, raca, sexo, rga, idade, foto, peso, castrado, tipopet, usuarioid)
VALUES
  (1, 'Thor', 'Golden Retriever', 'Macho', 'RGA1001', '4 anos', 'https://images.unsplash.com/photo-1552053831-71594a27632d', 28.5, true, 2, 1),
  (2, 'Luna', 'Yorkshire', 'Fêmea', 'RGA1002', '2 anos', 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9', 5.2, true, 2, 2),
  (3, 'Mia', 'Siamês', 'Fêmea', 'RGA1003', '3 anos', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba', 4.1, false, 1, 3),
  (4, 'Bob', 'Pastor Alemão', 'Macho', 'RGA1004', '6 anos', 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95', 31.4, false, 2, 4),
  (5, 'Nina', 'Maine Coon', 'Fêmea', 'RGA1005', '1 ano', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5', 4.8, true, 1, 5),
  (6, 'Mel', 'Poodle', 'Fêmea', 'RGA1006', '5 anos', 'https://images.unsplash.com/photo-1593134257782-e89567b7718a', 6.3, true, 2, 1),
  (7, 'Simba', 'Persa', 'Macho', 'RGA1007', '2 anos', 'https://images.unsplash.com/photo-1574158622682-e40e69881006', 4.6, false, 1, 1),
  (8, 'Apolo', 'Border Collie', 'Macho', 'RGA1008', '3 anos', 'https://images.unsplash.com/photo-1551717743-49959800b1f6', 18.9, true, 2, 2),
  (9, 'Amora', 'SRD', 'Fêmea', 'RGA1009', '7 meses', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee', 9.2, false, 2, 3),
  (10, 'Kiara', 'Angorá', 'Fêmea', 'RGA1010', '4 anos', 'https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e', 3.9, true, 1, 3)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome, raca = EXCLUDED.raca, sexo = EXCLUDED.sexo, rga = EXCLUDED.rga,
  idade = EXCLUDED.idade, foto = EXCLUDED.foto, peso = EXCLUDED.peso, castrado = EXCLUDED.castrado,
  tipopet = EXCLUDED.tipopet, usuarioid = EXCLUDED.usuarioid;

INSERT INTO pedido (id, usuarioid, datapedido)
VALUES
  (1, 1, '2026-05-01T10:00:00Z'),
  (2, 2, '2026-05-04T14:30:00Z'),
  (3, 3, '2026-05-08T09:15:00Z'),
  (4, 4, '2026-05-12T16:45:00Z'),
  (5, 5, '2026-05-20T11:20:00Z')
ON CONFLICT (id) DO UPDATE SET
  usuarioid = EXCLUDED.usuarioid, datapedido = EXCLUDED.datapedido;

INSERT INTO itempedido (id, pedidoid, produtoid, quantidade)
VALUES
  (1, 1, 1, 2),
  (2, 2, 2, 1),
  (3, 3, 3, 3),
  (4, 4, 4, 1),
  (5, 5, 5, 2)
ON CONFLICT (id) DO UPDATE SET
  pedidoid = EXCLUDED.pedidoid, produtoid = EXCLUDED.produtoid, quantidade = EXCLUDED.quantidade;

INSERT INTO servico (id, "dataServico", descricao, tipo, valor, petid)
VALUES
  (1, '2026-06-01T13:00:00Z', 'Consulta geral do Thor', 1, 120.00, 1),
  (2, '2026-06-02T14:00:00Z', 'Banho completo da Luna', 2, 70.00, 2),
  (3, '2026-06-03T15:00:00Z', 'Tosa higiênica da Mia', 3, 85.00, 3),
  (4, '2026-06-04T16:00:00Z', 'Consulta dermatológica do Bob', 1, 160.00, 4),
  (5, '2026-06-05T17:00:00Z', 'Banho da Nina', 2, 65.00, 5)
ON CONFLICT (id) DO UPDATE SET
  "dataServico" = EXCLUDED."dataServico", descricao = EXCLUDED.descricao,
  tipo = EXCLUDED.tipo, valor = EXCLUDED.valor, petid = EXCLUDED.petid;

DELETE FROM anuncio_petinder WHERE anuncioid BETWEEN 1 AND 15;
DELETE FROM anuncio_petfinder WHERE anuncioid BETWEEN 1 AND 15;
DELETE FROM anuncio_paypet WHERE anuncioid BETWEEN 1 AND 15;

INSERT INTO anuncio (id, descricao, tipoanuncio, datacriacao, criadortipo, criadorid, origemendereco, usuarioid)
VALUES
  (1, 'Thor procura novos amigos para brincar no parque.', 1, '2026-05-10T10:00:00Z', 1, 1, 1, 1),
  (2, 'Luna desapareceu perto da praça central.', 2, '2026-05-11T11:00:00Z', 1, 2, 1, 2),
  (3, 'Mia disponível para adoção responsável.', 3, '2026-05-12T12:00:00Z', 1, 3, 1, 3),
  (4, 'Bob com acessórios à venda junto ao anúncio PayPet.', 3, '2026-05-13T13:00:00Z', 2, 1, 2, 4),
  (5, 'Nina busca companhia felina tranquila.', 1, '2026-05-14T14:00:00Z', 1, 5, 1, 5),
  (6, 'Mel adora passeios e procura pares para socialização.', 1, '2026-05-15T09:00:00Z', 1, 1, 1, 1),
  (7, 'Simba quer conhecer outros gatos calmos.', 1, '2026-05-16T09:30:00Z', 1, 1, 1, 1),
  (8, 'Apolo sumiu após passeio no fim da tarde.', 2, '2026-05-17T10:00:00Z', 1, 2, 1, 2),
  (9, 'Amora escapou próximo ao mercado do bairro.', 2, '2026-05-18T10:30:00Z', 1, 3, 1, 3),
  (10, 'Kiara foi vista pela última vez perto do condomínio.', 2, '2026-05-19T11:00:00Z', 1, 3, 1, 3),
  (11, 'Thor com kit de acessórios seminovos.', 3, '2026-05-20T11:30:00Z', 1, 1, 1, 1),
  (12, 'Luna disponível para adoção com acompanhamento.', 3, '2026-05-21T12:00:00Z', 1, 2, 1, 2),
  (13, 'Simba para adoção responsável em lar tranquilo.', 3, '2026-05-22T12:30:00Z', 1, 1, 1, 1),
  (14, 'Bob procura companhia para treinos e caminhada.', 1, '2026-05-23T13:00:00Z', 2, 1, 2, 4),
  (15, 'Nina desapareceu durante mudança de residência.', 2, '2026-05-24T13:30:00Z', 1, 5, 1, 5)
ON CONFLICT (id) DO UPDATE SET
  descricao = EXCLUDED.descricao, tipoanuncio = EXCLUDED.tipoanuncio, datacriacao = EXCLUDED.datacriacao,
  criadortipo = EXCLUDED.criadortipo, criadorid = EXCLUDED.criadorid,
  origemendereco = EXCLUDED.origemendereco, usuarioid = EXCLUDED.usuarioid;

INSERT INTO anuncio_petinder (anuncioid, petid)
VALUES
  (1, 1),
  (5, 5),
  (6, 6),
  (7, 7),
  (14, 4)
ON CONFLICT (anuncioid) DO UPDATE SET petid = EXCLUDED.petid;

INSERT INTO anuncio_petfinder (anuncioid, petid, ultimolocalvisto, datadesaparecimento)
VALUES
  (2, 2, 'Praça central perto da fonte', '2026-05-09T08:00:00Z'),
  (8, 8, 'Parque municipal, portão lateral', '2026-05-16T18:20:00Z'),
  (9, 9, 'Mercado do bairro, rua dos Pinheiros', '2026-05-17T19:00:00Z'),
  (10, 10, 'Condomínio Vista Azul, bloco B', '2026-05-18T07:30:00Z'),
  (15, 5, 'Rua Ipê, próximo ao número 505', '2026-05-23T20:00:00Z')
ON CONFLICT (anuncioid) DO UPDATE SET
  petid = EXCLUDED.petid, ultimolocalvisto = EXCLUDED.ultimolocalvisto,
  datadesaparecimento = EXCLUDED.datadesaparecimento;

INSERT INTO anuncio_paypet (anuncioid, petid, tipopaypet, valor)
VALUES
  (3, 3, 1, 0.00),
  (4, 4, 2, 250.00),
  (11, 1, 2, 180.00),
  (12, 2, 1, 0.00),
  (13, 7, 1, 0.00)
ON CONFLICT (anuncioid) DO UPDATE SET
  petid = EXCLUDED.petid, tipopaypet = EXCLUDED.tipopaypet, valor = EXCLUDED.valor;

INSERT INTO agendaveterinario (id, veterinarioid, diassemanaativos, horainiciomanha, horafimmanha, horainiciotarde, horafimtarde, duracaominutos, datacriacao)
VALUES
  (1, 1, 62, '08:00:00', '11:00:00', '13:00:00', '17:00:00', 60, '2026-05-01T08:00:00Z'),
  (2, 2, 62, '08:00:00', '11:00:00', '13:00:00', '17:00:00', 60, '2026-05-01T08:00:00Z'),
  (3, 3, 30, '08:00:00', '11:00:00', '13:00:00', '17:00:00', 60, '2026-05-01T08:00:00Z'),
  (4, 4, 28, '08:00:00', '11:00:00', '13:00:00', '17:00:00', 60, '2026-05-01T08:00:00Z'),
  (5, 5, 48, '08:00:00', '11:00:00', '13:00:00', '17:00:00', 60, '2026-05-01T08:00:00Z')
ON CONFLICT (id) DO UPDATE SET
  veterinarioid = EXCLUDED.veterinarioid, diassemanaativos = EXCLUDED.diassemanaativos,
  horainiciomanha = EXCLUDED.horainiciomanha, horafimmanha = EXCLUDED.horafimmanha,
  horainiciotarde = EXCLUDED.horainiciotarde, horafimtarde = EXCLUDED.horafimtarde,
  duracaominutos = EXCLUDED.duracaominutos, datacriacao = EXCLUDED.datacriacao;

INSERT INTO agendamentoconsulta
  (id, veterinarioid, petid, usuarioid, datahorainicio, datahorafim, status, tiposervico, observacao, motivocancelamento, datacriacao, dataconfirmacao, datacancelamento, rowversion)
VALUES
  (1, 1, 1, 1, NULL, NULL, 1, 1, 'Tutor solicitou avaliação inicial.', NULL, '2026-05-21T09:00:00Z', NULL, NULL, decode('00000001', 'hex')),
  (2, 2, 2, 2, '2026-06-02T13:00:00Z', '2026-06-02T14:00:00Z', 2, 1, 'Consulta confirmada para vacinação.', NULL, '2026-05-22T09:00:00Z', '2026-05-22T10:00:00Z', NULL, decode('00000002', 'hex')),
  (3, 3, 3, 3, '2026-06-03T14:00:00Z', '2026-06-03T15:00:00Z', 2, 2, 'Banho agendado.', NULL, '2026-05-23T09:00:00Z', '2026-05-23T10:00:00Z', NULL, decode('00000003', 'hex')),
  (4, 4, 4, 4, '2026-06-04T15:00:00Z', '2026-06-04T16:00:00Z', 3, 3, 'Tutor precisou remarcar.', 'Conflito de horário do tutor.', '2026-05-24T09:00:00Z', NULL, '2026-05-24T10:00:00Z', decode('00000004', 'hex')),
  (5, 5, 5, 5, NULL, NULL, 1, 1, 'Solicitação para check-up da Nina.', NULL, '2026-05-25T09:00:00Z', NULL, NULL, decode('00000005', 'hex'))
ON CONFLICT (id) DO UPDATE SET
  veterinarioid = EXCLUDED.veterinarioid, petid = EXCLUDED.petid, usuarioid = EXCLUDED.usuarioid,
  datahorainicio = EXCLUDED.datahorainicio, datahorafim = EXCLUDED.datahorafim,
  status = EXCLUDED.status, tiposervico = EXCLUDED.tiposervico, observacao = EXCLUDED.observacao,
  motivocancelamento = EXCLUDED.motivocancelamento, datacriacao = EXCLUDED.datacriacao,
  dataconfirmacao = EXCLUDED.dataconfirmacao, datacancelamento = EXCLUDED.datacancelamento,
  rowversion = EXCLUDED.rowversion;

SELECT setval(pg_get_serial_sequence('usuario', 'id'), GREATEST((SELECT MAX(id) FROM usuario), 1), true);
SELECT setval(pg_get_serial_sequence('funcionario', 'id'), GREATEST((SELECT MAX(id) FROM funcionario), 1), true);
SELECT setval(pg_get_serial_sequence('administrador', 'id'), GREATEST((SELECT MAX(id) FROM administrador), 1), true);
SELECT setval(pg_get_serial_sequence('veterinario', 'id'), GREATEST((SELECT MAX(id) FROM veterinario), 1), true);
SELECT setval(pg_get_serial_sequence('produto', 'id'), GREATEST((SELECT MAX(id) FROM produto), 1), true);
SELECT setval(pg_get_serial_sequence('pet', 'id'), GREATEST((SELECT MAX(id) FROM pet), 1), true);
SELECT setval(pg_get_serial_sequence('pedido', 'id'), GREATEST((SELECT MAX(id) FROM pedido), 1), true);
SELECT setval(pg_get_serial_sequence('itempedido', 'id'), GREATEST((SELECT MAX(id) FROM itempedido), 1), true);
SELECT setval(pg_get_serial_sequence('servico', 'id'), GREATEST((SELECT MAX(id) FROM servico), 1), true);
SELECT setval(pg_get_serial_sequence('anuncio', 'id'), GREATEST((SELECT MAX(id) FROM anuncio), 1), true);
SELECT setval(pg_get_serial_sequence('agendaveterinario', 'id'), GREATEST((SELECT MAX(id) FROM agendaveterinario), 1), true);
SELECT setval(pg_get_serial_sequence('agendamentoconsulta', 'id'), GREATEST((SELECT MAX(id) FROM agendamentoconsulta), 1), true);

COMMIT;
""";

await using var connection = new NpgsqlConnection(connectionString);
await connection.OpenAsync();

await using var command = new NpgsqlCommand(sql, connection);
command.CommandTimeout = 60;
await command.ExecuteNonQueryAsync();

Console.WriteLine("Dados ficticios inseridos/atualizados com sucesso.");
Console.WriteLine("Logins criados em usuario, funcionario, administrador e veterinario:");
Console.WriteLine("- gabriel@gmail.com / 123456");
Console.WriteLine("- enzo@gmail.com / 123456");
Console.WriteLine("- yasmin@gmail.com / 123456");
Console.WriteLine($"- {enzoEmail} / {enzoPassword} (usuario, funcionario, administrador e veterinario)");
