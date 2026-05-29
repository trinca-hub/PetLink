import { AuthContext } from "@/src/context/AuthContext";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import {
  AgendaVeterinario,
  AgendaVeterinarioPayload,
  DiaSemana,
  SlotDisponivel,
  createAgendaVeterinario,
  getAgendaSlots,
  getAgendaVeterinario,
  updateAgendaVeterinario,
} from "@/src/api/agendaVeterinarioService";
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
  TouchableOpacity,
  View,
} from "react-native";

const DAY_OPTIONS: Array<{ value: DiaSemana; label: string }> = [
  { value: "Domingo", label: "Domingo" },
  { value: "Segunda", label: "Segunda" },
  { value: "Terca", label: "Terça" },
  { value: "Quarta", label: "Quarta" },
  { value: "Quinta", label: "Quinta" },
  { value: "Sexta", label: "Sexta" },
  { value: "Sabado", label: "Sábado" },
];

const FIXED_SCHEDULE = {
  horaInicioManha: "08:00:00",
  horaFimManha: "11:00:00",
  horaInicioTarde: "13:00:00",
  horaFimTarde: "17:00:00",
  duracaoMinutos: 60,
};

function parseDiasSemana(value: unknown): DiaSemana[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is DiaSemana => DAY_OPTIONS.some((d) => d.value === item));
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item): item is DiaSemana => DAY_OPTIONS.some((d) => d.value === item));
  }

  return [];
}

function formatSlot(slot: SlotDisponivel) {
  const start = new Date(slot.dataHoraInicio);
  const end = new Date(slot.dataHoraFim);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Horário inválido";
  }

  const date = start.toLocaleDateString("pt-BR");
  const startTime = start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const endTime = end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} • ${startTime} - ${endTime}`;
}

export default function VetAgenda() {
  const router = useRouter();
  const { token, user } = useContext(AuthContext);

  const [agenda, setAgenda] = useState<AgendaVeterinario | null>(null);
  const [selectedDays, setSelectedDays] = useState<DiaSemana[]>([]);
  const [slots, setSlots] = useState<SlotDisponivel[]>([]);
  const [loadingAgenda, setLoadingAgenda] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vetId = Number(user?.id || 0);

  const selectedDaySet = useMemo(() => new Set(selectedDays), [selectedDays]);

  const loadAgenda = useCallback(async () => {
    if (!token || !vetId) {
      setError("Faça login novamente para acessar a agenda.");
      setAgenda(null);
      setSelectedDays([]);
      setLoadingAgenda(false);
      return;
    }

    setError(null);
    const result = await getAgendaVeterinario(vetId, token);

    if (result.ok && result?.data?.data) {
      const agendaData = result.data.data as AgendaVeterinario;
      setAgenda(agendaData);
      setSelectedDays(parseDiasSemana(agendaData.diasSemanaAtivos));
    } else if (result.status === 404) {
      setAgenda(null);
      setSelectedDays([]);
    } else if (!result.ok) {
      setError(getApiErrorMessage(result?.data, "Não foi possível carregar a agenda."));
    }

    setLoadingAgenda(false);
  }, [token, vetId]);

  useEffect(() => {
    setLoadingAgenda(true);
    loadAgenda();
  }, [loadAgenda]);

  useEffect(() => {
    if (agenda) {
      loadSlots();
    }
  }, [agenda?.id]);

  async function loadSlots() {
    if (!token || !vetId) return;

    setLoadingSlots(true);
    const result = await getAgendaSlots(vetId, token);

    if (result.ok && Array.isArray(result?.data?.data)) {
      setSlots(result.data.data);
    } else if (!result.ok) {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível carregar os slots."));
    }

    setLoadingSlots(false);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadAgenda();
    await loadSlots();
    setRefreshing(false);
  }

  async function handleSave() {
    if (!token || !vetId) return;

    if (selectedDays.length === 0) {
      setError("Selecione ao menos um dia da semana.");
      return;
    }

    setSaving(true);
    setError(null);

    const payload: AgendaVeterinarioPayload = {
      veterinarioId: vetId,
      diasSemanaAtivos: selectedDays.join(","),
      horaInicioManha: FIXED_SCHEDULE.horaInicioManha,
      horaFimManha: FIXED_SCHEDULE.horaFimManha,
      horaInicioTarde: FIXED_SCHEDULE.horaInicioTarde,
      horaFimTarde: FIXED_SCHEDULE.horaFimTarde,
      duracaoMinutos: FIXED_SCHEDULE.duracaoMinutos,
    };

    const result = agenda
      ? await updateAgendaVeterinario(agenda.id, payload, token)
      : await createAgendaVeterinario(payload, token);

    setSaving(false);

    if (!result.ok) {
      setError(getApiErrorMessage(result?.data, "Não foi possível salvar a agenda."));
      return;
    }

    await loadAgenda();
    await loadSlots();
    Alert.alert("Sucesso", "Agenda salva com sucesso.");
  }

  function toggleDay(day: DiaSemana) {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day]
    );
  }

  const scheduleLabel = useMemo(
    () => "08:00–11:00 e 13:00–17:00 • 60 min",
    []
  );

  return (
    <LinearGradient colors={["#071321", "#0d1b2a", "#12263f"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        <View style={styles.headerCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.badge}>Veterinário</Text>
            <Text style={styles.title}>Minha agenda</Text>
            <Text style={styles.subtitle}>Configure sua disponibilidade semanal e visualize os próximos slots.</Text>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={16} color="#dbe9ff" />
            <Text style={styles.backButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        {loadingAgenda ? (
          <Text style={styles.infoText}>Carregando agenda...</Text>
        ) : (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Dias ativos</Text>
            <View style={styles.dayGrid}>
              {DAY_OPTIONS.map((day) => {
                const active = selectedDaySet.has(day.value);
                return (
                  <TouchableOpacity
                    key={day.value}
                    style={[styles.dayChip, active && styles.dayChipActive]}
                    onPress={() => toggleDay(day.value)}
                  >
                    <Text style={[styles.dayText, active && styles.dayTextActive]}>{day.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.scheduleBox}>
              <Ionicons name="time-outline" size={18} color="#cfe1ff" />
              <Text style={styles.scheduleText}>{scheduleLabel}</Text>
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving}>
              <Text style={styles.primaryButtonText}>{saving ? "Salvando..." : "Salvar agenda"}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Próximos slots</Text>
            <TouchableOpacity onPress={loadSlots} disabled={loadingSlots}>
              <Text style={styles.linkText}>{loadingSlots ? "Carregando..." : "Atualizar"}</Text>
            </TouchableOpacity>
          </View>

          {slots.length === 0 ? (
            <Text style={styles.infoText}>Nenhum slot disponível no momento.</Text>
          ) : (
            <View style={styles.slotList}>
              {slots.map((slot, index) => (
                <View key={`${slot.dataHoraInicio}-${index}`} style={styles.slotItem}>
                  <Ionicons name="calendar-outline" size={16} color="#d8e7ff" />
                  <Text style={styles.slotText}>{formatSlot(slot)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  dayGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  dayChip: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.3)",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  dayChipActive: { backgroundColor: "#1d67e0", borderColor: "#1d67e0" },
  dayText: { color: "#cfe1ff", fontSize: 12, fontWeight: "700" },
  dayTextActive: { color: "#fff" },
  scheduleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(38, 92, 167, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
  },
  scheduleText: { color: "#cfe1ff", fontSize: 13, fontWeight: "600" },
  primaryButton: {
    backgroundColor: "#1d67e0",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  infoText: { color: "#b7c8e8", fontSize: 13 },
  errorText: { color: "#ffb0b0", fontSize: 13 },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  linkText: { color: "#9fc0f6", fontWeight: "700", fontSize: 12 },
  slotList: { gap: 8 },
  slotItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "rgba(20, 56, 99, 0.55)",
  },
  slotText: { color: "#e7f0ff", fontSize: 13, fontWeight: "600" },
});
