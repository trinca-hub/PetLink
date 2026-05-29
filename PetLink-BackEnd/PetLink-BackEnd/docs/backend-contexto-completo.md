# Contexto Completo do Backend PetLink

## 1. Stack e infraestrutura
- ASP.NET Core (.NET 8)
- EF Core + PostgreSQL (Npgsql)
- JWT Authentication (claims por email)
- AutoMapper
- Swagger/OpenAPI

## 2. Arquitetura em camadas
- Controllers → Services → Repositories → EF Core (DbContext/Builders)
- DTOs para comunicação com frontend
- Enums para estados e tipos

## 3. Entidades principais
- Usuario
- Pet (relacionado a Usuario)
- Veterinario
- Servico (legado)
- AgendaVeterinario
- AgendamentoConsulta
- Anuncio e subtipos
- Pedido/ItemPedido
- Produto

## 4. Módulo de Agendamento Veterinário
### Entidades
**AgendaVeterinario**
- Id
- VeterinarioId
- DiasSemanaAtivos (enum Flags)
- HoraInicioManha / HoraFimManha
- HoraInicioTarde / HoraFimTarde
- DuracaoMinutos (60)
- DataCriacao

**AgendamentoConsulta**
- Id
- VeterinarioId
- PetId
- UsuarioId
- DataHoraInicio / DataHoraFim (nullable)
- Status (StatusAgendamento)
- TipoServico (enum)
- Observacao
- MotivoCancelamento
- DataCriacao / DataConfirmacao / DataCancelamento
- RowVersion (concorrência)

### Enums
- StatusAgendamento: Pendente, Confirmado, Cancelado
- DiasSemana (Flags): Domingo..Sabado
- TipoServico

## 5. Regras de negócio
- Agenda fixa: 08:00–11:00 e 13:00–17:00
- Duração fixa: 60 min
- Slots gerados para próximos 7 dias
- Não permitir horários passados
- Fluxo de status permitido:
  - Pendente → Confirmado
  - Pendente → Cancelado
  - Confirmado → Cancelado
- Não permitir:
  - Confirmado → Pendente
  - Cancelado → Confirmado
- Não permitir conflito com outro confirmado
- Não permitir solicitação pendente duplicada

## 6. Segurança
- JWT por email
- Tutor/veterinário só acessa dados próprios
- IDs sensíveis não confiados quando há claim

## 7. Endpoints principais
### AgendaVeterinario
- GET /api/v1/AgendaVeterinario/{veterinarioId}
- POST /api/v1/AgendaVeterinario
- PUT /api/v1/AgendaVeterinario/{id}
- GET /api/v1/AgendaVeterinario/{veterinarioId}/slots

### Agendamento
- POST /api/v1/Agendamento
- GET /api/v1/Agendamento/{id}
- GET /api/v1/Agendamento/tutor
- GET /api/v1/Agendamento/veterinario
- PUT /api/v1/Agendamento/{id}/confirmar
- PUT /api/v1/Agendamento/{id}/cancelar

## 8. Responses padronizadas
Formato:
{
  "message": "...",
  "data": { ... },
  "error": null
}

- JSON camelCase
- Enums serializados como string

## 9. Concorrência e integridade
- RowVersion na entidade de agendamento
- Confirmação em transação
- Check constraints no banco:
  - horários válidos
  - pendente sem horário
  - datas obrigatórias por status
  - dias ativos
  - duração fixa

## 10. Migrations
- AgendamentoVeterinario
- AgendamentoVeterinarioRevisao

## 11. Observações
- Controllers usam ApiResponseFactory para retorno consistente.
- Builders EF definem índices e constraints.
- Repositórios incluem consultas de conflito e listagens filtradas.
