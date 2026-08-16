# Contexto Técnico do Backend (PetLink)

> **Nota:** o backend é **ASP.NET Core (.NET 8)**, **não** Spring Boot.

---

## 1) Arquitetura do Projeto

### Estrutura de pastas/namspaces
- `PetLink_BackEnd.Controllers`
- `PetLink_BackEnd.Services.Interfaces`
- `PetLink_BackEnd.Services.Entities`
- `PetLink_BackEnd.Data`
- `PetLink_BackEnd.Data.Repositories`
- `PetLink_BackEnd.Data.Interfaces` / `PetLink_BackEnd.Data.Interafces`
- `PetLink_BackEnd.Data.Builders`
- `PetLink_BackEnd.Objects.Models`
- `PetLink_BackEnd.Objects.Dtos.Entities`
- `PetLink_BackEnd.Objects.Dtos.Entities.Feed`
- `PetLink_BackEnd.Objects.Enums`
- `PetLink_BackEnd.Objects.Contracts`

### Camadas
- **Controller**
- **Service**
- **Repository**
- **DTO**
- **Entity**
- **Config/Security** (`Program.cs`)

---

## 2) Entidades

### `Produto`
- Campos: `Id`, `Nome`, `Preco`, `Descricao`, `Quantidade`, `Foto?`

### `Usuario`
- Campos: `Id`, `Nome`, `Telefone`, `Cep`, `Uf`, `Cidade`, `Bairro`, `Rua`, `Numero`, `Email`, `Senha`

### `Funcionario`
- Campos: `Id`, `Nome`, `Email`, `Senha`, `Salario`

### `Administrador`
- Campos: `Id`, `Nome`, `Email`, `Senha`, `Status`
- Enum: `Status`

### `Veterinario`
- Campos: `Id`, `Nome`, `Crmv`, `Salario`, `Email`, `Senha`, `Status`
- Enum: `Status`

### `Pedido`
- Campos: `Id`, `UsuarioId`, `DataPedido`
- Relacionamento: `Usuario` (N:1)

### `ItemPedido`
- Campos: `Id`, `PedidoId`, `ProdutoId`, `Quantidade`
- Relacionamentos: `Pedido` (N:1), `Produto` (N:1)

### `Pet`
- Campos: `Id`, `Nome`, `Raca`, `Sexo`, `Rga`, `Idade`, `Foto?`, `Peso`, `Castrado`, `TipoPet`, `UsuarioId`
- Enum: `TipoPet`
- Relacionamento: `Usuario` (N:1)

### `Servico`
- Campos: `Id`, `DataServico`, `Descricao`, `Tipo`, `Valor`, `PetId`
- Relacionamento: `Pet` (N:1)
- Enum de referência: `TipoServico` (campo `Tipo` é `int`)

### `Anuncio` (base)
- Campos: `Id`, `Descricao`, `TipoAnuncio`, `DataCriacao`, `CriadorTipo`, `CriadorId`, `OrigemEndereco`, `UsuarioId?`
- Enums: `TipoAnuncio`, `CriadorAnuncio`, `OrigemEndereco`
- Relacionamento: `Usuario?` (N:1)

### `AnuncioPayPet`
- Campos: `AnuncioId`, `PetId`, `TipoPayPet`, `Valor?`
- Relacionamentos: `Anuncio` (1:1), `Pet` (N:1)

### `AnuncioPetFinder`
- Campos: `AnuncioId`, `PetId`, `UltimoLocalVisto`, `DataDesaparecimento`
- Relacionamentos: `Anuncio` (1:1), `Pet` (N:1)

### `AnuncioPeTinder`
- Campos: `AnuncioId`, `PetId`
- Relacionamentos: `Anuncio` (1:1), `Pet` (N:1)

---

## 3) DTOs

### Principais DTOs (request/response)
- `ProdutoDTO`: `Id`, `Nome`, `Preco`, `Descricao`, `Quantidade`, `Foto`
- `UsuarioDTO`: `Id`, `Nome`, `Telefone`, `Cep`, `Uf`, `Cidade`, `Bairro`, `Rua`, `Numero`, `Email`, `Senha`
- `FuncionarioDTO`: `Id`, `Nome`, `Email`, `Senha`, `Salario`
- `AdministradorDTO`: `Id`, `Nome`, `Email`, `Senha`, `Status`
- `VeterinarioDTO`: `Id`, `Nome`, `Crmv`, `Salario`, `Email`, `Senha`, `Status`
- `PetDTO`: `Id`, `Nome`, `Raca`, `Sexo`, `Rga`, `Idade`, `Peso`, `Castrado`, `Foto?`, `TipoPet`, `UsuarioId`
- `ServicoDTO`: `Id`, `DataServico`, `Descricao`, `Tipo`, `Valor`, `PetId`
- `PedidoDTO`: `Id`, `UsuarioId`, `DataPedido`
- `ItemPedidoDTO`: `Id`, `PedidoId`, `ProdutoId`, `Quantidade`
- `CriarAnuncioDTO`: `Descricao`, `TipoAnuncio`, `UsuarioId?`, `CriadorId?`, `PayPet?`, `PetFinder?`, `PeTinder?`
- `EditarPetFinderDTO`: `UltimoLocalVisto`, `DataDesaparecimento`
- `EditarPayPetDTO`: `TipoPayPet`, `Valor?`
- `AdminCreatePedidoDTO`: `UsuarioId?`, `EmNomeProprio`, `DataPedido?`
- `Login`: `Email`, `Password`

### Feeds
- `PetinderFeedDTO`
- `PetfinderFeedDTO`
- `PaypetFeedDTO`
- `AdminAnuncioFeedDTO` (usado no serviço de anúncios)

---

## 4) Endpoints REST (resumo)

### `ProdutoController` (`/api/v1/Produto`)
- `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`

### `UsuarioController` (`/api/v1/Usuario`)
- `GET /`, `GET /{id}`, `POST /` (público), `POST /Login` (público), `GET /me`, `PUT /{id}`, `DELETE /{id}`

### `FuncionarioController` (`/api/v1/Funcionario`)
- `GET /`, `GET /{id}`, `POST /` (público), `POST /Login` (público), `GET /me`, `PUT /{id}`, `DELETE /{id}`

### `VeterinarioController` (`/api/v1/Veterinario`)
- `GET /`, `GET /{id}`, `POST /` (público), `POST /Login` (público), `GET /me`, `PUT /{id}`, `DELETE /{id}`

### `AdministradorController` (`/api/v1/Administrador`)
- `GET /`, `GET /{id}`, `POST /` (público), `POST /Login` (público), `GET /me`, `PUT /{id}`, `DELETE /{id}`

### `PetController` (`/api/v1/Pet`)
- `GET /`, `GET /{id}`, `GET /usuario/{usuarioId}`, `GET /meus`, `POST /`, `PUT /{id}`, `DELETE /{id}`
- Admin: `GET /admin`, `POST /admin`, `PUT /admin/{id}`, `DELETE /admin/{id}`

### `ServicoController` (`/api/v1/Servico`)
- `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`
- Admin: `GET /admin`, `POST /admin`, `PUT /admin/{id}`, `DELETE /admin/{id}`

### `PedidoController` (`/api/v1/Pedido`)
- `GET /`, `GET /{id}`, `GET /usuario/{usuarioId}`, `POST /` (retorna `id`), `PUT /{id}`, `DELETE /{id}`
- Admin: `GET /admin`, `POST /admin`, `DELETE /admin/{id}`

### `ItemPedidoController` (`/api/v1/ItemPedido`)
- `GET /`, `GET /{id}`, `GET /pedido/{pedidoId}`, `POST /`, `PUT /{id}`, `DELETE /{id}`
- Admin: `GET /admin`, `GET /admin/pedido/{pedidoId}`, `POST /admin`, `DELETE /admin/{id}`

### `AnuncioController` (`/api/v1/Anuncio`)
- Feeds (públicos):  
  - `GET /feed/petinder`  
  - `GET /feed/petfinder`  
  - `GET /feed/paypet`
- Admin feed: `GET /admin/feed`
- CRUD: `GET /`, `GET /{id}`, `POST /`, `PUT /{id}`, `DELETE /{id}`
- Subtipos: `PUT /{id}/petfinder`, `PUT /{id}/paypet`
- Admin: `PUT /admin/{id}`, `DELETE /admin/{id}`, `PUT /admin/{id}/petfinder`, `PUT /admin/{id}/paypet`

---

## 5) Segurança

- JWT Bearer em `Program.cs`.
- Token contém `sub`, `nameidentifier`, `email`.
- Senha hash **SHA-256**.
- Usuário autenticado: claim `email`.
- Admin: validação por email existente em `Administrador`.

---

## 6) Fluxo de Agendamento

### Entidade existente
- `Servico` (mais próximo de agenda/consulta)

### Endpoints reutilizáveis
- `POST /api/v1/Servico`
- `GET /api/v1/Servico`
- `GET /api/v1/Servico/{id}`
- `PUT /api/v1/Servico/{id}`

### Endpoints faltantes (não existem)
- Vínculo com veterinário.
- Disponibilidade de horários.
- Status do agendamento.
- Reagendamento/cancelamento com regras específicas.

---

## 7) Exemplos

### Login (request)
```
{
  "email": "gabriel@gmail.com",
  "password": "123456"
}
```

### Login (response)
```
{
  "code": 1,
  "message": "Login realizado com sucesso",
  "data": {
	"token": "<jwt>",
	"usuario": {
	  "id": 1,
	  "nome": "Gabriel",
	  "email": "gabriel@gmail.com",
	  "telefone": "179999999",
	  "cep": "15790000",
	  "uf": "São Paulo",
	  "cidade": "Rubineia",
	  "bairro": "Clone",
	  "rua": "Rua dos Guerreiros",
	  "numero": 1,
	  "senha": ""
	}
  }
}
```

---

## 8) Regras de negócio importantes

- Login retorna `token` + usuário (senha limpa).
- `CriarAnuncioDTO` exige **exatamente 1** subtipo.
- `PetId` deve existir e pertencer ao `UsuarioId`.
- Edição/exclusão de anúncio só pelo dono (token).
- `PayPet`: venda exige `Valor > 0`.
- `ItemPedido` valida estoque e decrementa; remoção repõe estoque.
- `Pedido` cancelado remove itens e repõe estoque.

### Enums
- `Status`: `ATIVO=1`, `DESATIVO=2`
- `TipoAnuncio`: `PETINDER=1`, `PETFINDER=2`, `PAYPET=3`
- `TipoPayPet`: `ADOCAO=1`, `VENDA=2`
- `TipoPet`: `GATO=1`, `CACHORRO=2`
- `TipoServico`: `CONSULTA=1`, `BANHO=2`, `TOSA=3`
