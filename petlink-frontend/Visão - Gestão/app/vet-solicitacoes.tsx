import { AuthContext } from "@/src/context/AuthContext";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import { getPetsByUsuario, Pet } from "@/src/api/petService";
import {
  AgendamentoConsulta,
  StatusAgendamento,
  TipoServico,
  createAgendamentoVeterinario,
  getAgendamentosVeterinario,
} from "@/src/api/agendamentoService";
import { getUsuarios, Usuario } from "@/src/api/usuarioService";
import ListControls, { FilterGroup, SortState, TextFilter } from "@/components/ListControls";
import SearchableSelectModal, { SelectOption } from "@/components/SearchableSelectModal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const STATUS_FILTERS: Array<StatusAgendamento | "Todos"> = [
  "Todos",
  "Pendente",
  "Confirmado",
  "Cancelado",
];

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function statusColor(status: StatusAgendamento) {
  if (status === "Confirmado") return "#74d199";
  if (status === "Cancelado") return "#f28b82";
  return "#f6c453";
}

const TIPO_SERVICO_LABEL: Record<number, string> = {
  1: "Consulta",
  2: "Banho",
  3: "Tosa",
};

function formatTipoServico(value?: TipoServico | null) {
  if (!value) return "-";
  return TIPO_SERVICO_LABEL[value] || `Tipo ${value}`;
}

export default function VetSolicitacoes() {
  const router = useRouter();
  const { token, user } = useContext(AuthContext);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [agendamentos, setAgendamentos] = useState<AgendamentoConsulta[]>([]);
  const [selectedUsuarioId, setSelectedUsuarioId] = useState<string>("");
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openUsuarioSelect, setOpenUsuarioSelect] = useState(false);
  const [openPetSelect, setOpenPetSelect] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusAgendamento | "Todos">("Todos");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ field: "", direction: "none" });
  const [tutorFilter, setTutorFilter] = useState("");
  const [petFilter, setPetFilter] = useState("");

  const petById = useMemo(() => {
    const map: Record<number, Pet> = {};
    pets.forEach((pet) => {
      map[pet.id] = pet;
    });
    return map;
  }, [pets]);

  const usersById = useMemo(() => {
    const map: Record<number, Usuario> = {};
    usuarios.forEach((usuario) => {
      map[usuario.id] = usuario;
    });
    return map;
  }, [usuarios]);

  const usuarioOptions = useMemo<SelectOption[]>(
    () =>
      usuarios.map((usuario) => ({
        value: String(usuario.id),
        label: usuario.nome,
        subtitle: `ID ${usuario.id} • ${usuario.email}`,
      })),
    [usuarios]
  );

  const petOptions = useMemo<SelectOption[]>(
    () =>
      pets.map((pet) => ({
        value: String(pet.id),
        label: pet.nome,
        subtitle: `ID ${pet.id} • Tutor ${usersById[pet.usuarioId]?.nome || pet.usuarioId}`,
      })),
    [pets, usersById]
  );

  const filteredAgendamentos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedTutor = tutorFilter.trim().toLowerCase();
    const normalizedPet = petFilter.trim().toLowerCase();

    const result = agendamentos.filter((item) => {
      const petNome = petById[item.petId]?.nome || "";
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
        (statusFilter === "Todos" || item.status === statusFilter) &&
        (!normalizedSearch || searchable.includes(normalizedSearch)) &&
        (!normalizedTutor || tutorNome.toLowerCase().includes(normalizedTutor) || String(item.usuarioId).includes(normalizedTutor)) &&
        (!normalizedPet || petNome.toLowerCase().includes(normalizedPet) || String(item.petId).includes(normalizedPet))
      );
    });

    if (sort.direction === "none") return result;

    return [...result].sort((a, b) => {
      const direction = sort.direction === "asc" ? 1 : -1;
      if (sort.field === "id") return (a.id - b.id) * direction;
      if (sort.field === "data") {
        return ((new Date(a.dataHoraInicio || "").getTime() || 0) - (new Date(b.dataHoraInicio || "").getTime() || 0)) * direction;
      }
      if (sort.field === "status") return (a.status || "").localeCompare(b.status || "") * direction;
      if (sort.field === "tutor") return (usersById[a.usuarioId]?.nome || "").localeCompare(usersById[b.usuarioId]?.nome || "") * direction;
      return (petById[a.petId]?.nome || "").localeCompare(petById[b.petId]?.nome || "") * direction;
    });
  }, [agendamentos, statusFilter, search, tutorFilter, petFilter, sort, petById, usersById]);

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
        onChange: (value) => setStatusFilter(value as StatusAgendamento | "Todos"),
        options: STATUS_FILTERS.map((status) => ({ label: status, value: status })),
      },
    ],
    [statusFilter]
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
      setError(getApiErrorMessage(usuariosResult?.data, "Não foi possível carregar usuários."));
    }

    if (agendamentosResult.ok && Array.isArray(agendamentosResult?.data?.data)) {
      setAgendamentos(agendamentosResult.data.data);
    } else if (!agendamentosResult.ok) {
      setError(getApiErrorMessage(agendamentosResult?.data, "Não foi possível carregar solicitações."));
    }

    setLoading(false);
  }, [token]);

  const loadPetsForUsuario = useCallback(
    async (usuarioId: number) => {
      if (!token) return;

      const petsResult = await getPetsByUsuario(usuarioId, token);
      if (petsResult.ok && Array.isArray(petsResult?.data?.data)) {
        setPets(petsResult.data.data);
      } else if (!petsResult.ok) {
        setPets([]);
        setError(getApiErrorMessage(petsResult?.data, "Não foi possível carregar pets do tutor."));
      }
    },
    [token]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const parsed = Number(selectedUsuarioId);
    if (!parsed || Number.isNaN(parsed)) {
      setPets([]);
      setSelectedPetId("");
      return;
    }

    loadPetsForUsuario(parsed);
  }, [selectedUsuarioId, loadPetsForUsuario]);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleCreate() {
    if (!token || !user?.id) return;

    const parsedUsuarioId = Number(selectedUsuarioId);
    if (!parsedUsuarioId || Number.isNaN(parsedUsuarioId)) {
      setError("Selecione um tutor para solicitar a consulta.");
      return;
    }

    if (!selectedPetId) {
      setError("Selecione um pet para solicitar a consulta.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      usuarioId: parsedUsuarioId,
      petId: Number(selectedPetId),
      tipoServico: 1 as TipoServico,
      observacao: observacao.trim() || undefined,
    };

    const result = await createAgendamentoVeterinario(payload, token);
    setSaving(false);

    if (!result.ok) {
      setError(getApiErrorMessage(result?.data, "Não foi possível criar a solicitação."));
      return;
    }

    Alert.alert("Solicitação enviada", "O tutor poderá confirmar o agendamento.");
    setObservacao("");
    setSelectedUsuarioId("");
    setSelectedPetId("");
    await loadData();
  }

  const selectedUsuario = usersById[Number(selectedUsuarioId)];
  const selectedPet = petById[Number(selectedPetId)];

  return (
    <LinearGradient colors={["#071321", "#0d1b2a", "#12263f"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        <View style={styles.headerCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.badge}>Veterinário</Text>
            <Text style={styles.title}>Solicitações de consulta</Text>
            <Text style={styles.subtitle}>Envie solicitações e acompanhe o status das consultas.</Text>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={16} color="#dbe9ff" />
            <Text style={styles.backButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Nova solicitação</Text>

          <TouchableOpacity style={styles.selectButton} onPress={() => setOpenUsuarioSelect(true)}>
            <Text style={styles.selectLabel}>Tutor</Text>
            <Text style={styles.selectValue}>
              {selectedUsuario ? `${selectedUsuario.nome} (ID ${selectedUsuario.id})` : "Selecionar tutor"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => {
              if (!selectedUsuarioId) {
                setError("Selecione um tutor antes de escolher o pet.");
                return;
              }
              setOpenPetSelect(true);
            }}
          >
            <Text style={styles.selectLabel}>Pet</Text>
            <Text style={styles.selectValue}>
              {selectedPet ? `${selectedPet.nome} (ID ${selectedPet.id})` : "Selecionar pet"}
            </Text>
          </TouchableOpacity>

          <View style={styles.selectButton}>
            <Text style={styles.selectLabel}>Tipo de serviço</Text>
            <Text style={styles.selectValue}>Consulta</Text>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Observação (opcional)"
            placeholderTextColor="#98abc9"
            value={observacao}
            onChangeText={setObservacao}
            multiline
          />

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity style={styles.primaryButton} onPress={handleCreate} disabled={saving}>
            <Text style={styles.primaryButtonText}>{saving ? "Enviando..." : "Enviar solicitação"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Solicitações recentes</Text>
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

          {false && (
          <View style={styles.filterRow}>
            {STATUS_FILTERS.map((status) => {
              const active = statusFilter === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterChip, active && styles.filterChipActive]}
                  onPress={() => setStatusFilter(status)}
                >
                  <Text style={[styles.filterText, active && styles.filterTextActive]}>{status}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          )}

          {loading ? (
            <Text style={styles.infoText}>Carregando solicitações...</Text>
          ) : filteredAgendamentos.length === 0 ? (
            <Text style={styles.infoText}>Nenhuma solicitação encontrada.</Text>
          ) : (
            <View style={styles.listWrap}>
              {filteredAgendamentos.map((item) => (
                <View key={item.id} style={styles.itemCard}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={styles.itemTitle}>Solicitação #{item.id}</Text>
                    <Text style={styles.itemSubtitle}>Pet: {petById[item.petId]?.nome || `ID ${item.petId}`}</Text>
                    <Text style={styles.itemSubtitle}>
                      Tutor: {usersById[item.usuarioId]?.nome || `ID ${item.usuarioId}`}
                    </Text>
                    <Text style={styles.itemSubtitle}>Tipo: {formatTipoServico(item.tipoServico)}</Text>
                    <Text style={styles.itemSubtitle}>Status: {item.status}</Text>
                    <Text style={styles.itemSubtitle}>Horário: {formatDateTime(item.dataHoraInicio)}</Text>
                    {item.observacao ? (
                      <Text style={styles.itemSubtitle}>Obs: {item.observacao}</Text>
                    ) : null}
                  </View>
                  <View style={[styles.statusPill, { backgroundColor: statusColor(item.status) }]}
                  >
                    <Text style={styles.statusText}>{item.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 14,
  },
  headerCard: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.30)",
    backgroundColor: "rgba(19, 37, 59, 0.9)",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  badge: { color: "#9fc0f6", fontSize: 12, fontWeight: "700", marginBottom: 3 },
  title: { color: "#eff5ff", fontSize: 30, fontWeight: "700", lineHeight: 34 },
  subtitle: { color: "#b7c8e8", marginTop: 4, fontSize: 14, lineHeight: 20 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(26, 72, 130, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(138, 180, 248, 0.4)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  backButtonText: { color: "#dbe9ff", fontWeight: "700", fontSize: 13 },
  card: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.20)",
    backgroundColor: "rgba(13, 32, 53, 0.88)",
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  sectionTitle: { color: "#edf4ff", fontSize: 16, fontWeight: "700" },
  selectButton: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(20, 56, 99, 0.45)",
    gap: 2,
  },
  selectLabel: { color: "#9fc0f6", fontSize: 11, fontWeight: "700" },
  selectValue: { color: "#eaf2ff", fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#eaf2ff",
    backgroundColor: "rgba(20, 56, 99, 0.45)",
    minHeight: 70,
    textAlignVertical: "top",
  },
  primaryButton: {
    backgroundColor: "#1d67e0",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  errorText: { color: "#ffb0b0", fontSize: 13 },
  infoText: { color: "#b7c8e8", fontSize: 13 },
  filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  filterChip: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.35)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  filterChipActive: { backgroundColor: "#1d67e0", borderColor: "#1d67e0" },
  filterText: { color: "#cfe1ff", fontSize: 12, fontWeight: "700" },
  filterTextActive: { color: "#fff" },
  listWrap: { gap: 10 },
  itemCard: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.20)",
    backgroundColor: "rgba(20, 56, 99, 0.55)",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  itemTitle: { color: "#f4f8ff", fontSize: 15, fontWeight: "700" },
  itemSubtitle: { color: "#b7c8e8", fontSize: 12 },
  statusPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  statusText: { color: "#0b1c2c", fontWeight: "800", fontSize: 11 },
});
