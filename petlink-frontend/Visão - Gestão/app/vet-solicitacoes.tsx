import { AuthContext } from "@/src/context/AuthContext";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import { getAdminPets, Pet } from "@/src/api/petService";
import {
  AgendamentoConsulta,
  StatusAgendamento,
  createAgendamento,
  getAgendamentosVeterinario,
} from "@/src/api/agendamentoService";
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

export default function VetSolicitacoes() {
  const router = useRouter();
  const { token, user } = useContext(AuthContext);

  const [pets, setPets] = useState<Pet[]>([]);
  const [agendamentos, setAgendamentos] = useState<AgendamentoConsulta[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [observacao, setObservacao] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openPetSelect, setOpenPetSelect] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusAgendamento | "Todos">("Todos");

  const petById = useMemo(() => {
    const map: Record<number, Pet> = {};
    pets.forEach((pet) => {
      map[pet.id] = pet;
    });
    return map;
  }, [pets]);

  const petOptions = useMemo<SelectOption[]>(
    () =>
      pets.map((pet) => ({
        value: String(pet.id),
        label: pet.nome,
        subtitle: `ID ${pet.id} • Tutor ${pet.usuarioId}`,
      })),
    [pets]
  );

  const filteredAgendamentos = useMemo(() => {
    if (statusFilter === "Todos") return agendamentos;
    return agendamentos.filter((item) => item.status === statusFilter);
  }, [agendamentos, statusFilter]);

  const loadData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    const [petsResult, agendamentosResult] = await Promise.all([
      getAdminPets(token),
      getAgendamentosVeterinario(token),
    ]);

    if (petsResult.ok && Array.isArray(petsResult?.data?.data)) {
      setPets(petsResult.data.data);
    } else {
      setError(getApiErrorMessage(petsResult?.data, "Não foi possível carregar pets."));
    }

    if (agendamentosResult.ok && Array.isArray(agendamentosResult?.data?.data)) {
      setAgendamentos(agendamentosResult.data.data);
    } else if (!agendamentosResult.ok) {
      setError(getApiErrorMessage(agendamentosResult?.data, "Não foi possível carregar solicitações."));
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleCreate() {
    if (!token || !user?.id) return;

    if (!selectedPetId) {
      setError("Selecione um pet para solicitar a consulta.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload = {
      veterinarioId: Number(user.id),
      petId: Number(selectedPetId),
      tipoServico: "Consulta",
      observacao: observacao.trim() || undefined,
    };

    const result = await createAgendamento(payload, token);
    setSaving(false);

    if (!result.ok) {
      setError(getApiErrorMessage(result?.data, "Não foi possível criar a solicitação."));
      return;
    }

    Alert.alert("Solicitação enviada", "O tutor poderá confirmar o agendamento.");
    setObservacao("");
    setSelectedPetId("");
    await loadData();
  }

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

          <TouchableOpacity style={styles.selectButton} onPress={() => setOpenPetSelect(true)}>
            <Text style={styles.selectLabel}>Pet</Text>
            <Text style={styles.selectValue}>{selectedPet ? `${selectedPet.nome} (ID ${selectedPet.id})` : "Selecionar pet"}</Text>
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
                    <Text style={styles.itemSubtitle}>Tutor ID: {item.usuarioId}</Text>
                    <Text style={styles.itemSubtitle}>Tipo: {item.tipoServico}</Text>
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
