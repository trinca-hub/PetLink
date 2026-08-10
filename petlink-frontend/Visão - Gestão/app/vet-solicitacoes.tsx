import ListControls, { FilterGroup, SortState, TextFilter } from "@/components/ListControls";
import { EmptyState, ManagementScreen } from "@/components/ManagementScreen";
import SearchableSelectModal, { SelectOption } from "@/components/SearchableSelectModal";
import { managementStyles, managementTheme } from "@/constants/managementTheme";
import {
  AgendamentoConsulta,
  StatusAgendamento,
  TipoServico,
  cancelarAgendamento,
  confirmarAgendamento,
  createAgendamentoVeterinario,
  getAgendamentosVeterinario,
  recusarAgendamento,
  remarcarAgendamento,
} from "@/src/api/agendamentoService";
import {
  SlotDisponivel,
  filtrarSlotsHorarioAtendimento,
  getAgendaSlots,
  isDataHoraDentroHorarioAtendimento,
} from "@/src/api/agendaVeterinarioService";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import { getPetsByUsuario, Pet } from "@/src/api/petService";
import { getUsuarios, Usuario } from "@/src/api/usuarioService";
import { AuthContext } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type StatusFilter = StatusAgendamento | "todos";
type ReasonModalState = {
  type: "reject" | "cancel";
  item: AgendamentoConsulta;
} | null;

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "Todos", value: "todos" },
  { label: "Pendentes", value: "Pendente" },
  { label: "Confirmados", value: "Confirmado" },
  { label: "Cancelados", value: "Cancelado" },
  { label: "Recusados", value: "Recusado" },
];

const TIPO_SERVICO_LABEL: Record<number, string> = {
  1: "Consulta",
  2: "Banho",
  3: "Tosa",
};

function formatTipoServico(value?: TipoServico | null) {
  if (!value) return "-";
  return TIPO_SERVICO_LABEL[value] || `Tipo ${value}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "Horario nao definido";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Horario invalido";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTimeRange(slot?: SlotDisponivel | null) {
  if (!slot) return "";
  const start = new Date(slot.dataHoraInicio);
  const end = new Date(slot.dataHoraFim);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Horario invalido";

  const options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  return `${start.toLocaleTimeString("pt-BR", options)} - ${end.toLocaleTimeString("pt-BR", options)}`;
}

function formatDateTitle(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data invalida";
  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function slotDateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function statusMeta(status: StatusAgendamento) {
  if (status === "Confirmado") {
    return {
      label: "Confirmado",
      icon: "checkmark-circle-outline" as const,
      badge: styles.statusSuccess,
      text: styles.statusSuccessText,
    };
  }

  if (status === "Cancelado") {
    return {
      label: "Cancelado",
      icon: "close-circle-outline" as const,
      badge: styles.statusDanger,
      text: styles.statusDangerText,
    };
  }

  if (status === "Recusado") {
    return {
      label: "Recusado",
      icon: "ban-outline" as const,
      badge: styles.statusDanger,
      text: styles.statusDangerText,
    };
  }

  return {
    label: "Pendente",
    icon: "time-outline" as const,
    badge: styles.statusWarning,
    text: styles.statusWarningText,
  };
}

function isToday(value?: string | null) {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export default function VetSolicitacoes() {
  const router = useRouter();
  const { token, user } = useContext(AuthContext);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [formPets, setFormPets] = useState<Pet[]>([]);
  const [petMap, setPetMap] = useState<Record<number, Pet>>({});
  const [agendamentos, setAgendamentos] = useState<AgendamentoConsulta[]>([]);
  const [agendaSlots, setAgendaSlots] = useState<SlotDisponivel[]>([]);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState("");
  const [selectedPetId, setSelectedPetId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingPets, setLoadingPets] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [operationKey, setOperationKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [openUsuarioSelect, setOpenUsuarioSelect] = useState(false);
  const [openPetSelect, setOpenPetSelect] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ field: "data", direction: "desc" });
  const [tutorFilter, setTutorFilter] = useState("");
  const [petFilter, setPetFilter] = useState("");
  const [reasonModal, setReasonModal] = useState<ReasonModalState>(null);
  const [reasonText, setReasonText] = useState("");
  const [rescheduleTarget, setRescheduleTarget] = useState<AgendamentoConsulta | null>(null);
  const [rescheduleSlot, setRescheduleSlot] = useState("");
  const [rescheduleReason, setRescheduleReason] = useState("");

  const vetId = Number(user?.id || 0);

  const usersById = useMemo(() => {
    const map: Record<number, Usuario> = {};
    usuarios.forEach((usuario) => {
      map[usuario.id] = usuario;
    });
    return map;
  }, [usuarios]);

  const selectedUsuario = usersById[Number(selectedUsuarioId)];
  const selectedPet = formPets.find((pet) => String(pet.id) === selectedPetId);

  const usuarioOptions = useMemo<SelectOption[]>(
    () =>
      usuarios.map((usuario) => ({
        value: String(usuario.id),
        label: usuario.nome,
        subtitle: `ID ${usuario.id} | ${usuario.email}`,
      })),
    [usuarios]
  );

  const petOptions = useMemo<SelectOption[]>(
    () =>
      formPets.map((pet) => ({
        value: String(pet.id),
        label: pet.nome,
        subtitle: `${pet.raca || "Sem raca"} | ID ${pet.id}`,
      })),
    [formPets]
  );

  const slotGroups = useMemo(() => {
    const map: Record<string, SlotDisponivel[]> = {};

    agendaSlots.forEach((slot) => {
      const key = slotDateKey(slot.dataHoraInicio);
      if (!map[key]) map[key] = [];
      map[key].push(slot);
    });

    return Object.keys(map)
      .sort()
      .map((key) => ({
        key,
        title: formatDateTitle(map[key][0].dataHoraInicio),
        items: map[key].sort((a, b) => a.dataHoraInicio.localeCompare(b.dataHoraInicio)),
      }));
  }, [agendaSlots]);

  const filteredAgendamentos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedTutor = tutorFilter.trim().toLowerCase();
    const normalizedPet = petFilter.trim().toLowerCase();

    const result = agendamentos.filter((item) => {
      const petNome = petMap[item.petId]?.nome || "";
      const tutorNome = usersById[item.usuarioId]?.nome || "";
      const searchable = [
        String(item.id),
        petNome,
        String(item.petId),
        tutorNome,
        String(item.usuarioId),
        formatTipoServico(item.tipoServico),
        item.status,
        item.observacao,
        item.dataHoraInicio,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (statusFilter === "todos" || item.status === statusFilter) &&
        (!normalizedSearch || searchable.includes(normalizedSearch)) &&
        (!normalizedTutor ||
          tutorNome.toLowerCase().includes(normalizedTutor) ||
          String(item.usuarioId).includes(normalizedTutor)) &&
        (!normalizedPet ||
          petNome.toLowerCase().includes(normalizedPet) ||
          String(item.petId).includes(normalizedPet))
      );
    });

    return [...result].sort((a, b) => {
      if (sort.direction === "none") return 0;
      const direction = sort.direction === "asc" ? 1 : -1;

      if (sort.field === "id") return (a.id - b.id) * direction;
      if (sort.field === "status") return a.status.localeCompare(b.status) * direction;
      if (sort.field === "tutor") {
        return (usersById[a.usuarioId]?.nome || "").localeCompare(usersById[b.usuarioId]?.nome || "") * direction;
      }
      if (sort.field === "pet") {
        return (petMap[a.petId]?.nome || "").localeCompare(petMap[b.petId]?.nome || "") * direction;
      }

      const aTime = new Date(a.dataHoraInicio || a.dataCriacao || "").getTime() || 0;
      const bTime = new Date(b.dataHoraInicio || b.dataCriacao || "").getTime() || 0;
      return (aTime - bTime) * direction;
    });
  }, [agendamentos, petMap, usersById, search, tutorFilter, petFilter, statusFilter, sort]);

  const metrics = useMemo(() => {
    const pending = agendamentos.filter((item) => item.status === "Pendente").length;
    const confirmed = agendamentos.filter((item) => item.status === "Confirmado").length;
    const today = agendamentos.filter((item) => isToday(item.dataHoraInicio)).length;
    const closed = agendamentos.filter((item) => item.status === "Cancelado" || item.status === "Recusado").length;

    return { pending, confirmed, today, closed };
  }, [agendamentos]);

  const textFilters = useMemo<TextFilter[]>(
    () => [
      { label: "Tutor", value: tutorFilter, onChange: setTutorFilter, placeholder: "Pesquisar por tutor" },
      { label: "Pet", value: petFilter, onChange: setPetFilter, placeholder: "Pesquisar por pet" },
    ],
    [tutorFilter, petFilter]
  );

  const filters = useMemo<FilterGroup[]>(
    () => [
      {
        label: "Status",
        value: statusFilter,
        onChange: (value) => setStatusFilter(value as StatusFilter),
        options: STATUS_FILTERS,
      },
    ],
    [statusFilter]
  );

  const loadAgendaSlots = useCallback(async () => {
    if (!token || !vetId) return;

    setLoadingSlots(true);
    const result = await getAgendaSlots(vetId, token);
    setLoadingSlots(false);

    if (result.ok && Array.isArray(result?.data?.data)) {
      setAgendaSlots(filtrarSlotsHorarioAtendimento(result.data.data));
    } else {
      setAgendaSlots([]);
      setError(getApiErrorMessage(result?.data, "Nao foi possivel carregar horarios da agenda."));
    }
  }, [token, vetId]);

  const loadPetsForAgendamentos = useCallback(
    async (items: AgendamentoConsulta[]) => {
      if (!token) return;

      const userIds = Array.from(new Set(items.map((item) => item.usuarioId).filter(Boolean)));
      const results = await Promise.all(
        userIds.map(async (usuarioId) => {
          const result = await getPetsByUsuario(usuarioId, token);
          return result.ok && Array.isArray(result?.data?.data) ? result.data.data : [];
        })
      );

      const map: Record<number, Pet> = {};
      results.flat().forEach((pet: Pet) => {
        map[pet.id] = pet;
      });
      setPetMap(map);
    },
    [token]
  );

  const loadData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    const [usuariosResult, agendamentosResult] = await Promise.all([
      getUsuarios(token),
      getAgendamentosVeterinario(token),
    ]);

    if (usuariosResult.ok && Array.isArray(usuariosResult?.data?.data)) {
      setUsuarios(usuariosResult.data.data);
    } else {
      setError(getApiErrorMessage(usuariosResult?.data, "Nao foi possivel carregar tutores."));
    }

    if (agendamentosResult.ok && Array.isArray(agendamentosResult?.data?.data)) {
      const items = agendamentosResult.data.data as AgendamentoConsulta[];
      setAgendamentos(items);
      await loadPetsForAgendamentos(items);
    } else {
      setAgendamentos([]);
      setError(getApiErrorMessage(agendamentosResult?.data, "Nao foi possivel carregar solicitacoes."));
    }

    setLoading(false);
  }, [token, loadPetsForAgendamentos]);

  const loadPetsForUsuario = useCallback(
    async (usuarioId: number) => {
      if (!token) return;

      setLoadingPets(true);
      const result = await getPetsByUsuario(usuarioId, token);
      setLoadingPets(false);

      if (result.ok && Array.isArray(result?.data?.data)) {
        setFormPets(result.data.data);
      } else {
        setFormPets([]);
        setError(getApiErrorMessage(result?.data, "Nao foi possivel carregar pets deste tutor."));
      }
    },
    [token]
  );

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    void loadAgendaSlots();
  }, [loadAgendaSlots]);

  useEffect(() => {
    const usuarioId = Number(selectedUsuarioId);
    setSelectedPetId("");

    if (!usuarioId || Number.isNaN(usuarioId)) {
      setFormPets([]);
      return;
    }

    void loadPetsForUsuario(usuarioId);
  }, [selectedUsuarioId, loadPetsForUsuario]);

  async function refreshAll() {
    await Promise.all([loadData(), loadAgendaSlots()]);
  }

  async function handleCreate() {
    if (!token || !vetId) return;

    const usuarioId = Number(selectedUsuarioId);
    const petId = Number(selectedPetId);

    if (!usuarioId) {
      setError("Selecione um tutor para criar a solicitacao.");
      return;
    }

    if (!petId) {
      setError("Selecione o pet que sera atendido.");
      return;
    }

    if (!selectedSlot) {
      setError("Selecione um horario disponivel para sugerir ao tutor.");
      return;
    }

    if (!isDataHoraDentroHorarioAtendimento(selectedSlot)) {
      setError("O horario deve estar entre 08:00-11:00 ou 13:00-17:00.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    const result = await createAgendamentoVeterinario(
      {
        usuarioId,
        petId,
        tipoServico: 1 as TipoServico,
        dataHoraInicio: selectedSlot,
        observacao: observacao.trim() || undefined,
      },
      token
    );

    setSaving(false);

    if (!result.ok) {
      setError(getApiErrorMessage(result?.data, "Nao foi possivel criar a solicitacao."));
      return;
    }

    setNotice("Solicitacao enviada ao tutor com horario sugerido.");
    setSelectedUsuarioId("");
    setSelectedPetId("");
    setSelectedSlot("");
    setObservacao("");
    await refreshAll();
  }

  async function runOperation(key: string, action: () => Promise<any>, successMessage: string) {
    setOperationKey(key);
    setError(null);
    setNotice(null);

    const result = await action();
    setOperationKey(null);

    if (!result.ok) {
      setError(getApiErrorMessage(result?.data, "Nao foi possivel concluir a acao."));
      return false;
    }

    setNotice(successMessage);
    await refreshAll();
    return true;
  }

  async function handleAccept(item: AgendamentoConsulta) {
    if (!token) return;

    if (!item.dataHoraInicio) {
      setRescheduleTarget(item);
      setRescheduleSlot("");
      setRescheduleReason("Definir horario para confirmacao");
      return;
    }

    if (!isDataHoraDentroHorarioAtendimento(item.dataHoraInicio)) {
      setError("O horario da solicitacao esta fora do periodo de atendimento.");
      return;
    }

    await runOperation(
      `accept-${item.id}`,
      () => confirmarAgendamento(item.id, { dataHoraInicio: item.dataHoraInicio || undefined }, token),
      "Consulta confirmada."
    );
  }

  function openReasonModal(type: "reject" | "cancel", item: AgendamentoConsulta) {
    setReasonModal({ type, item });
    setReasonText("");
    setError(null);
  }

  async function submitReasonModal() {
    if (!token || !reasonModal) return;

    if (reasonModal.type === "reject" && !reasonText.trim()) {
      setError("Informe o motivo da recusa.");
      return;
    }

    const success = await runOperation(
      `${reasonModal.type}-${reasonModal.item.id}`,
      () =>
        reasonModal.type === "reject"
          ? recusarAgendamento(reasonModal.item.id, { motivo: reasonText.trim() }, token)
          : cancelarAgendamento(
              reasonModal.item.id,
              reasonText.trim() ? { motivo: reasonText.trim() } : null,
              token
            ),
      reasonModal.type === "reject" ? "Consulta recusada com motivo registrado." : "Consulta cancelada."
    );

    if (success) setReasonModal(null);
  }

  function openReschedule(item: AgendamentoConsulta) {
    setRescheduleTarget(item);
    setRescheduleSlot("");
    setRescheduleReason("");
    setError(null);
  }

  async function handleReschedule() {
    if (!token || !rescheduleTarget) return;

    if (!rescheduleSlot) {
      setError("Selecione um novo horario para remarcar.");
      return;
    }

    if (!isDataHoraDentroHorarioAtendimento(rescheduleSlot)) {
      setError("O horario deve estar entre 08:00-11:00 ou 13:00-17:00.");
      return;
    }

    const success = await runOperation(
      `reschedule-${rescheduleTarget.id}`,
      () =>
        remarcarAgendamento(
          rescheduleTarget.id,
          {
            dataHoraInicio: rescheduleSlot,
            motivo: rescheduleReason.trim() || undefined,
          },
          token
        ),
      "Remarcacao enviada ao tutor."
    );

    if (success) setRescheduleTarget(null);
  }

  return (
    <ManagementScreen
      eyebrow="Veterinario"
      title="Solicitacoes de consulta"
      subtitle="Acompanhe pedidos do tutor, proponha horarios da agenda e registre recusas ou remarcacoes com contexto."
      action={{ label: "Dashboard", icon: "arrow-back-outline", onPress: () => router.back() }}
    >
      <View style={styles.metricsGrid}>
        <MetricCard label="Pendentes" value={metrics.pending} icon="time-outline" tone="warning" />
        <MetricCard label="Confirmadas" value={metrics.confirmed} icon="checkmark-circle-outline" tone="success" />
        <MetricCard label="Hoje" value={metrics.today} icon="calendar-outline" tone="info" />
        <MetricCard label="Encerradas" value={metrics.closed} icon="archive-outline" tone="danger" />
      </View>

      {!!error && (
        <View style={styles.feedbackError}>
          <Ionicons name="alert-circle-outline" size={18} color="#fecaca" />
          <Text style={styles.feedbackErrorText}>{error}</Text>
        </View>
      )}

      {!!notice && (
        <View style={styles.feedbackSuccess}>
          <Ionicons name="checkmark-circle-outline" size={18} color="#bbf7d0" />
          <Text style={styles.feedbackSuccessText}>{notice}</Text>
        </View>
      )}

      <View style={styles.workspaceGrid}>
        <View style={[managementStyles.panel, styles.formPanel]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.sectionTitle}>Nova solicitacao</Text>
              <Text style={styles.sectionSubtitle}>Envie um pedido ao tutor com pet e horario sugerido.</Text>
            </View>
            {saving && <ActivityIndicator color={managementTheme.colors.accent} />}
          </View>

          <View style={styles.formGrid}>
            <TouchableOpacity style={styles.selectButton} onPress={() => setOpenUsuarioSelect(true)}>
              <Text style={styles.fieldLabel}>Tutor</Text>
              <Text style={styles.fieldValue}>
                {selectedUsuario ? `${selectedUsuario.nome} | ID ${selectedUsuario.id}` : "Selecionar tutor"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.selectButton, !selectedUsuarioId && styles.fieldDisabled]}
              onPress={() => selectedUsuarioId && setOpenPetSelect(true)}
              disabled={!selectedUsuarioId || loadingPets}
            >
              <Text style={styles.fieldLabel}>Pet</Text>
              <Text style={styles.fieldValue}>
                {loadingPets
                  ? "Carregando pets..."
                  : selectedPet
                    ? `${selectedPet.nome} | ${selectedPet.raca || "Sem raca"}`
                    : "Selecionar pet"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.slotSection}>
            <View style={styles.panelHeader}>
              <View>
                <Text style={styles.fieldLabel}>Horario sugerido</Text>
                <Text style={styles.sectionSubtitle}>Disponibilidade da sua agenda nos proximos dias.</Text>
              </View>
              <TouchableOpacity style={styles.iconAction} onPress={loadAgendaSlots} disabled={loadingSlots}>
                {loadingSlots ? (
                  <ActivityIndicator color={managementTheme.colors.text} />
                ) : (
                  <Ionicons name="refresh-outline" size={17} color={managementTheme.colors.text} />
                )}
              </TouchableOpacity>
            </View>

            {slotGroups.length === 0 ? (
              <View style={styles.emptyCompact}>
                <Ionicons name="calendar-clear-outline" size={20} color={managementTheme.colors.textSubtle} />
                <Text style={styles.emptyCompactText}>Nenhum horario disponivel na agenda.</Text>
              </View>
            ) : (
              <ScrollView style={styles.slotPicker} contentContainerStyle={styles.slotPickerContent}>
                {slotGroups.map((group) => (
                  <View key={group.key} style={styles.slotGroup}>
                    <Text style={styles.slotGroupTitle}>{group.title}</Text>
                    <View style={styles.slotChips}>
                      {group.items.map((slot) => {
                        const active = selectedSlot === slot.dataHoraInicio;
                        return (
                          <TouchableOpacity
                            key={slot.dataHoraInicio}
                            style={[styles.slotChip, active && styles.slotChipActive]}
                            onPress={() => setSelectedSlot(slot.dataHoraInicio)}
                          >
                            <Text style={[styles.slotChipText, active && styles.slotChipTextActive]}>
                              {formatTimeRange(slot)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <TextInput
            style={styles.textArea}
            placeholder="Observacao clinica ou contexto para o tutor"
            placeholderTextColor="#94a3b8"
            value={observacao}
            onChangeText={setObservacao}
            multiline
          />

          <TouchableOpacity
            style={[managementStyles.primaryButton, styles.submitButton, saving && styles.disabledButton]}
            onPress={handleCreate}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="#fff" /> : <Ionicons name="send-outline" size={18} color="#fff" />}
            <Text style={managementStyles.buttonText}>{saving ? "Enviando..." : "Enviar solicitacao"}</Text>
          </TouchableOpacity>
        </View>

        <View style={[managementStyles.panel, styles.listPanel]}>
          <View style={styles.panelHeader}>
            <View>
              <Text style={styles.sectionTitle}>Fila de consultas</Text>
              <Text style={styles.sectionSubtitle}>Priorize pendencias e acompanhe confirmacoes.</Text>
            </View>
            <TouchableOpacity style={managementStyles.secondaryButton} onPress={refreshAll}>
              <Ionicons name="refresh-outline" size={18} color={managementTheme.colors.text} />
              <Text style={managementStyles.secondaryButtonText}>Atualizar</Text>
            </TouchableOpacity>
          </View>

          <ListControls
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar por tutor, pet, status..."
            sort={sort}
            onSortChange={setSort}
            sortFields={[
              { label: "Data", value: "data", type: "date" },
              { label: "Tutor", value: "tutor", type: "text" },
              { label: "Pet", value: "pet", type: "text" },
              { label: "Status", value: "status", type: "text" },
              { label: "ID", value: "id", type: "number" },
            ]}
            textFilters={textFilters}
            filters={filters}
            resultCount={filteredAgendamentos.length}
            totalCount={agendamentos.length}
          />

          {loading ? (
            <EmptyState icon="hourglass-outline" title="Carregando solicitacoes..." />
          ) : filteredAgendamentos.length === 0 ? (
            <EmptyState
              icon="calendar-clear-outline"
              title="Nenhuma solicitacao encontrada"
              description="Ajuste os filtros ou envie uma nova solicitacao para o tutor."
            />
          ) : (
            <View style={styles.requestList}>
              {filteredAgendamentos.map((item) => (
                <RequestCard
                  key={item.id}
                  item={item}
                  pet={petMap[item.petId]}
                  usuario={usersById[item.usuarioId]}
                  operationKey={operationKey}
                  onAccept={() => handleAccept(item)}
                  onReject={() => openReasonModal("reject", item)}
                  onCancel={() => openReasonModal("cancel", item)}
                  onReschedule={() => openReschedule(item)}
                />
              ))}
            </View>
          )}
        </View>
      </View>

      <SearchableSelectModal
        visible={openUsuarioSelect}
        title="Selecionar tutor"
        options={usuarioOptions}
        onClose={() => setOpenUsuarioSelect(false)}
        onSelect={(option) => {
          setSelectedUsuarioId(option.value);
          setSelectedPetId("");
        }}
      />

      <SearchableSelectModal
        visible={openPetSelect}
        title="Selecionar pet"
        options={petOptions}
        onClose={() => setOpenPetSelect(false)}
        onSelect={(option) => setSelectedPetId(option.value)}
      />

      <ReasonModal
        state={reasonModal}
        value={reasonText}
        loading={operationKey === `reject-${reasonModal?.item.id}` || operationKey === `cancel-${reasonModal?.item.id}`}
        onChange={setReasonText}
        onClose={() => setReasonModal(null)}
        onSubmit={submitReasonModal}
      />

      <RescheduleModal
        item={rescheduleTarget}
        slots={slotGroups}
        selectedSlot={rescheduleSlot}
        reason={rescheduleReason}
        loading={operationKey === `reschedule-${rescheduleTarget?.id}`}
        onSlotChange={setRescheduleSlot}
        onReasonChange={setRescheduleReason}
        onClose={() => setRescheduleTarget(null)}
        onSubmit={handleReschedule}
      />
    </ManagementScreen>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  tone: "success" | "warning" | "danger" | "info";
}) {
  const toneStyle =
    tone === "success"
      ? styles.metricSuccess
      : tone === "warning"
        ? styles.metricWarning
        : tone === "danger"
          ? styles.metricDanger
          : styles.metricInfo;

  return (
    <View style={styles.metricCard}>
      <View style={[styles.metricIcon, toneStyle]}>
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
      <View>
        <Text style={styles.metricValue}>{value}</Text>
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
    </View>
  );
}

function RequestCard({
  item,
  pet,
  usuario,
  operationKey,
  onAccept,
  onReject,
  onCancel,
  onReschedule,
}: {
  item: AgendamentoConsulta;
  pet?: Pet;
  usuario?: Usuario;
  operationKey: string | null;
  onAccept: () => void;
  onReject: () => void;
  onCancel: () => void;
  onReschedule: () => void;
}) {
  const meta = statusMeta(item.status);
  const isPending = item.status === "Pendente";
  const isConfirmed = item.status === "Confirmado";
  const responsavelPelaPropostaAtual = item.ultimoResponsavelRemarcacao ?? item.origemSolicitacao;
  const canAccept = isPending && responsavelPelaPropostaAtual === "Tutor";
  const canReject = canAccept && item.origemSolicitacao === "Tutor";
  const canCancel = isConfirmed || (isPending && item.origemSolicitacao === "Veterinario");
  const currentOperation =
    operationKey === `accept-${item.id}` ||
    operationKey === `reject-${item.id}` ||
    operationKey === `cancel-${item.id}` ||
    operationKey === `reschedule-${item.id}`;

  return (
    <View style={styles.requestCard}>
      <View style={styles.requestTopRow}>
        <View style={styles.requestTitleWrap}>
          <Text style={styles.requestTitle}>Consulta #{item.id}</Text>
          <Text style={styles.requestSubtitle}>{formatTipoServico(item.tipoServico)}</Text>
        </View>
        <View style={[styles.statusBadge, meta.badge]}>
          <Ionicons name={meta.icon} size={14} color={meta.text.color} />
          <Text style={[styles.statusText, meta.text]}>{meta.label}</Text>
        </View>
      </View>

      <View style={styles.requestInfoGrid}>
        <InfoRow icon="person-outline" label="Tutor" value={usuario?.nome || `ID ${item.usuarioId}`} />
        <InfoRow icon="paw-outline" label="Pet" value={pet?.nome || `ID ${item.petId}`} />
        <InfoRow icon="calendar-outline" label="Horario" value={formatDateTime(item.dataHoraInicio)} />
        <InfoRow icon="medical-outline" label="Criado em" value={formatDateTime(item.dataCriacao)} />
      </View>

      {!!item.observacao && (
        <View style={styles.noteBox}>
          <Text style={styles.noteLabel}>Observacao</Text>
          <Text style={styles.noteText}>{item.observacao}</Text>
        </View>
      )}

      {!!item.motivoRecusa && (
        <View style={styles.noteBoxDanger}>
          <Text style={styles.noteLabelDanger}>Motivo da recusa</Text>
          <Text style={styles.noteTextDanger}>{item.motivoRecusa}</Text>
        </View>
      )}

      {!!item.motivoRemarcacao && (
        <View style={styles.noteBox}>
          <Text style={styles.noteLabel}>Remarcacao</Text>
          <Text style={styles.noteText}>{item.motivoRemarcacao}</Text>
        </View>
      )}

      {(isPending || isConfirmed) && (
        <View style={styles.cardActions}>
          {canAccept && (
            <ActionButton
              label="Aceitar"
              icon="checkmark-outline"
              tone="success"
              loading={operationKey === `accept-${item.id}`}
              disabled={currentOperation}
              onPress={onAccept}
            />
          )}

          {canReject && (
            <ActionButton
              label="Recusar"
              icon="close-outline"
              tone="danger"
              loading={operationKey === `reject-${item.id}`}
              disabled={currentOperation}
              onPress={onReject}
            />
          )}

          {isPending && (
            <ActionButton
              label="Remarcar"
              icon="swap-horizontal-outline"
              tone="neutral"
              loading={operationKey === `reschedule-${item.id}`}
              disabled={currentOperation}
              onPress={onReschedule}
            />
          )}

          {canCancel && (
            <ActionButton
              label="Cancelar"
              icon="trash-outline"
              tone="danger"
              loading={operationKey === `cancel-${item.id}`}
              disabled={currentOperation}
              onPress={onCancel}
            />
          )}
        </View>
      )}
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={15} color={managementTheme.colors.accent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  tone,
  loading,
  disabled,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tone: "success" | "danger" | "neutral";
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
}) {
  const toneStyle =
    tone === "success" ? styles.actionSuccess : tone === "danger" ? styles.actionDanger : styles.actionNeutral;
  const textStyle =
    tone === "success" ? styles.actionSuccessText : tone === "danger" ? styles.actionDangerText : styles.actionNeutralText;

  return (
    <TouchableOpacity
      style={[styles.actionButton, toneStyle, disabled && styles.disabledButton]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
    >
      {loading ? <ActivityIndicator size="small" color={textStyle.color} /> : <Ionicons name={icon} size={16} color={textStyle.color} />}
      <Text style={[styles.actionButtonText, textStyle]}>{loading ? "Aguarde" : label}</Text>
    </TouchableOpacity>
  );
}

function ReasonModal({
  state,
  value,
  loading,
  onChange,
  onClose,
  onSubmit,
}: {
  state: ReasonModalState;
  value: string;
  loading: boolean;
  onChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const isReject = state?.type === "reject";

  return (
    <Modal visible={!!state} transparent animationType="fade" onRequestClose={onClose}>
      <View style={managementStyles.modalOverlay}>
        <View style={managementStyles.modalCard}>
          <View style={[styles.modalIcon, isReject ? styles.modalIconDanger : styles.modalIconWarning]}>
            <Ionicons name={isReject ? "close-circle-outline" : "trash-outline"} size={22} color={isReject ? "#fecaca" : "#fde68a"} />
          </View>
          <Text style={managementStyles.modalTitle}>{isReject ? "Recusar consulta" : "Cancelar consulta"}</Text>
          <Text style={managementStyles.infoText}>
            {isReject
              ? "Informe o motivo para que o tutor entenda a recusa."
              : "Registre um motivo opcional para manter o historico claro."}
          </Text>

          <TextInput
            style={styles.modalInput}
            placeholder={isReject ? "Motivo da recusa" : "Motivo do cancelamento"}
            placeholderTextColor="#94a3b8"
            value={value}
            onChangeText={onChange}
            multiline
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={managementStyles.secondaryButton} onPress={onClose} disabled={loading}>
              <Text style={managementStyles.secondaryButtonText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[isReject ? styles.modalDangerButton : styles.modalWarningButton, loading && styles.disabledButton]}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="send-outline" size={17} color="#fff" />}
              <Text style={styles.modalActionText}>{loading ? "Enviando..." : isReject ? "Recusar" : "Cancelar"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function RescheduleModal({
  item,
  slots,
  selectedSlot,
  reason,
  loading,
  onSlotChange,
  onReasonChange,
  onClose,
  onSubmit,
}: {
  item: AgendamentoConsulta | null;
  slots: { key: string; title: string; items: SlotDisponivel[] }[];
  selectedSlot: string;
  reason: string;
  loading: boolean;
  onSlotChange: (value: string) => void;
  onReasonChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  return (
    <Modal visible={!!item} transparent animationType="fade" onRequestClose={onClose}>
      <View style={managementStyles.modalOverlay}>
        <View style={[managementStyles.modalCard, styles.rescheduleCard]}>
          <View style={styles.modalIcon}>
            <Ionicons name="swap-horizontal-outline" size={22} color={managementTheme.colors.accent} />
          </View>
          <Text style={managementStyles.modalTitle}>Remarcar consulta</Text>
          <Text style={managementStyles.infoText}>Escolha um horario disponivel da sua agenda para enviar ao tutor.</Text>

          <ScrollView style={styles.modalSlotList} contentContainerStyle={styles.modalSlotListContent}>
            {slots.length === 0 ? (
              <Text style={styles.emptyCompactText}>Nenhum horario disponivel.</Text>
            ) : (
              slots.map((group) => (
                <View key={group.key} style={styles.slotGroup}>
                  <Text style={styles.slotGroupTitle}>{group.title}</Text>
                  <View style={styles.slotChips}>
                    {group.items.map((slot) => {
                      const active = selectedSlot === slot.dataHoraInicio;
                      return (
                        <TouchableOpacity
                          key={slot.dataHoraInicio}
                          style={[styles.slotChip, active && styles.slotChipActive]}
                          onPress={() => onSlotChange(slot.dataHoraInicio)}
                        >
                          <Text style={[styles.slotChipText, active && styles.slotChipTextActive]}>
                            {formatTimeRange(slot)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <TextInput
            style={styles.modalInput}
            placeholder="Motivo da remarcacao (opcional)"
            placeholderTextColor="#94a3b8"
            value={reason}
            onChangeText={onReasonChange}
            multiline
          />

          <View style={styles.modalActions}>
            <TouchableOpacity style={managementStyles.secondaryButton} onPress={onClose} disabled={loading}>
              <Text style={managementStyles.secondaryButtonText}>Voltar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalPrimaryButton, loading && styles.disabledButton]} onPress={onSubmit} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Ionicons name="send-outline" size={17} color="#fff" />}
              <Text style={styles.modalActionText}>{loading ? "Enviando..." : "Enviar remarcacao"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    minWidth: 180,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: managementTheme.colors.surface,
    borderRadius: managementTheme.radii.lg,
    padding: 15,
  },
  metricIcon: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  metricInfo: { backgroundColor: managementTheme.colors.primary },
  metricSuccess: { backgroundColor: managementTheme.colors.success },
  metricWarning: { backgroundColor: managementTheme.colors.warning },
  metricDanger: { backgroundColor: managementTheme.colors.danger },
  metricValue: {
    color: managementTheme.colors.text,
    fontSize: 24,
    fontWeight: "900",
  },
  metricLabel: {
    color: managementTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  feedbackError: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: managementTheme.radii.md,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.28)",
    backgroundColor: managementTheme.colors.dangerSoft,
    padding: 12,
  },
  feedbackErrorText: {
    flex: 1,
    color: "#fecaca",
    fontWeight: "800",
  },
  feedbackSuccess: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: managementTheme.radii.md,
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.28)",
    backgroundColor: managementTheme.colors.successSoft,
    padding: 12,
  },
  feedbackSuccessText: {
    flex: 1,
    color: "#bbf7d0",
    fontWeight: "800",
  },
  workspaceGrid: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
    flexWrap: "wrap",
  },
  formPanel: {
    flex: 0.9,
    minWidth: 320,
  },
  listPanel: {
    flex: 1.4,
    minWidth: 360,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  sectionTitle: {
    color: managementTheme.colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  sectionSubtitle: {
    color: managementTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  formGrid: {
    gap: 10,
  },
  selectButton: {
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: managementTheme.colors.surfaceMuted,
    borderRadius: managementTheme.radii.md,
    paddingVertical: 11,
    paddingHorizontal: 12,
    gap: 3,
  },
  fieldDisabled: {
    opacity: 0.58,
  },
  fieldLabel: {
    color: managementTheme.colors.accent,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  fieldValue: {
    color: managementTheme.colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  slotSection: {
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: "rgba(15,23,42,0.42)",
    borderRadius: managementTheme.radii.md,
    padding: 12,
    gap: 10,
  },
  iconAction: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: managementTheme.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
  },
  emptyCompact: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: "rgba(15,23,42,0.52)",
    borderRadius: managementTheme.radii.md,
    padding: 12,
  },
  emptyCompactText: {
    color: managementTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
  slotPicker: {
    maxHeight: 240,
  },
  slotPickerContent: {
    gap: 12,
    paddingBottom: 2,
  },
  slotGroup: {
    gap: 8,
  },
  slotGroupTitle: {
    color: managementTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  slotChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slotChip: {
    minWidth: 104,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: managementTheme.colors.surfaceMuted,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 11,
    alignItems: "center",
  },
  slotChipActive: {
    borderColor: managementTheme.colors.accent,
    backgroundColor: managementTheme.colors.primary,
  },
  slotChipText: {
    color: managementTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "900",
  },
  slotChipTextActive: {
    color: "#fff",
  },
  textArea: {
    minHeight: 86,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    borderRadius: managementTheme.radii.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: managementTheme.colors.text,
    backgroundColor: managementTheme.colors.surfaceMuted,
    textAlignVertical: "top",
    fontWeight: "700",
  },
  submitButton: {
    alignSelf: "flex-start",
    minWidth: 178,
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.6,
  },
  requestList: {
    gap: 10,
  },
  requestCard: {
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: managementTheme.colors.surfaceMutedStrong,
    borderRadius: managementTheme.radii.lg,
    padding: 14,
    gap: 12,
  },
  requestTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  requestTitleWrap: {
    flex: 1,
  },
  requestTitle: {
    color: managementTheme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  requestSubtitle: {
    color: managementTheme.colors.textMuted,
    marginTop: 2,
    fontSize: 12,
    fontWeight: "800",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "900",
  },
  statusSuccess: { backgroundColor: managementTheme.colors.successSoft },
  statusWarning: { backgroundColor: managementTheme.colors.warningSoft },
  statusDanger: { backgroundColor: managementTheme.colors.dangerSoft },
  statusSuccessText: { color: "#bbf7d0" },
  statusWarningText: { color: "#fde68a" },
  statusDangerText: { color: "#fecaca" },
  requestInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  infoRow: {
    flexGrow: 1,
    flexBasis: "46%",
    minWidth: 190,
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: "rgba(15,23,42,0.38)",
    borderRadius: managementTheme.radii.md,
    padding: 10,
  },
  infoLabel: {
    color: managementTheme.colors.textSubtle,
    fontSize: 11,
    fontWeight: "800",
  },
  infoValue: {
    color: managementTheme.colors.text,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 2,
  },
  noteBox: {
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: "rgba(37,99,235,0.10)",
    borderRadius: managementTheme.radii.md,
    padding: 10,
  },
  noteLabel: {
    color: managementTheme.colors.accent,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  noteText: {
    color: managementTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    fontWeight: "700",
  },
  noteBoxDanger: {
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.24)",
    backgroundColor: managementTheme.colors.dangerSoft,
    borderRadius: managementTheme.radii.md,
    padding: 10,
  },
  noteLabelDanger: {
    color: "#fecaca",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  noteTextDanger: {
    color: "#fecaca",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4,
    fontWeight: "700",
  },
  cardActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  actionButton: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: managementTheme.radii.md,
    paddingVertical: 8,
    paddingHorizontal: 11,
    borderWidth: 1,
  },
  actionSuccess: {
    backgroundColor: managementTheme.colors.success,
    borderColor: managementTheme.colors.success,
  },
  actionDanger: {
    backgroundColor: managementTheme.colors.dangerSoft,
    borderColor: "rgba(248,113,113,0.28)",
  },
  actionNeutral: {
    backgroundColor: managementTheme.colors.surfaceMuted,
    borderColor: managementTheme.colors.border,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "900",
  },
  actionSuccessText: { color: "#052e1a" },
  actionDangerText: { color: "#fecaca" },
  actionNeutralText: { color: managementTheme.colors.text },
  modalIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
  },
  modalIconDanger: {
    backgroundColor: managementTheme.colors.dangerSoft,
    borderColor: "rgba(248,113,113,0.28)",
  },
  modalIconWarning: {
    backgroundColor: managementTheme.colors.warningSoft,
    borderColor: "rgba(245,158,11,0.28)",
  },
  modalInput: {
    minHeight: 92,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    borderRadius: managementTheme.radii.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: managementTheme.colors.text,
    backgroundColor: managementTheme.colors.surfaceMuted,
    textAlignVertical: "top",
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  modalDangerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: managementTheme.colors.danger,
    borderRadius: managementTheme.radii.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalWarningButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: managementTheme.colors.warning,
    borderRadius: managementTheme.radii.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: managementTheme.colors.primary,
    borderRadius: managementTheme.radii.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  modalActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
  rescheduleCard: {
    maxWidth: 680,
  },
  modalSlotList: {
    maxHeight: 300,
  },
  modalSlotListContent: {
    gap: 12,
    paddingBottom: 4,
  },
});
