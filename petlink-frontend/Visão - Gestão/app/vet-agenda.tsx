import { EmptyState, ManagementScreen } from "@/components/ManagementScreen";
import { managementStyles, managementTheme } from "@/constants/managementTheme";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import {
  AgendaVeterinario,
  AgendaVeterinarioPayload,
  DiaSemana,
  SlotDisponivel,
  bloquearAgendaSlot,
  createAgendaVeterinario,
  filtrarSlotsHorarioAtendimento,
  getAgendaSlots,
  getAgendaVeterinario,
  updateAgendaVeterinario,
} from "@/src/api/agendaVeterinarioService";
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
  TouchableOpacity,
  View,
} from "react-native";

const DAY_OPTIONS: { value: DiaSemana; label: string; bit: number }[] = [
  { value: "Domingo", label: "Domingo", bit: 1 },
  { value: "Segunda", label: "Segunda", bit: 2 },
  { value: "Terca", label: "Terca", bit: 4 },
  { value: "Quarta", label: "Quarta", bit: 8 },
  { value: "Quinta", label: "Quinta", bit: 16 },
  { value: "Sexta", label: "Sexta", bit: 32 },
  { value: "Sabado", label: "Sabado", bit: 64 },
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
    return value.filter((item): item is DiaSemana => DAY_OPTIONS.some((day) => day.value === item));
  }

  if (typeof value === "number") {
    return DAY_OPTIONS.filter((day) => (value & day.bit) === day.bit).map((day) => day.value);
  }

  if (typeof value === "string") {
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) {
      return parseDiasSemana(numeric);
    }

    return value
      .split(",")
      .map((item) => item.trim())
      .filter((item): item is DiaSemana => DAY_OPTIONS.some((day) => day.value === item));
  }

  return [];
}

function selectedDaysToFlags(days: DiaSemana[]) {
  return DAY_OPTIONS.reduce((total, day) => (days.includes(day.value) ? total + day.bit : total), 0);
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function formatDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  if (!year || !month || !day) return key;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return key;

  return date.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatSlotTime(slot?: SlotDisponivel | null) {
  if (!slot) return "";

  const start = new Date(slot.dataHoraInicio);
  const end = new Date(slot.dataHoraFim);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Horario invalido";

  const timeOptions: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  return `${start.toLocaleTimeString("pt-BR", timeOptions)} - ${end.toLocaleTimeString("pt-BR", timeOptions)}`;
}

export default function VetAgenda() {
  const router = useRouter();
  const { token, user } = useContext(AuthContext);

  const [agenda, setAgenda] = useState<AgendaVeterinario | null>(null);
  const [selectedDays, setSelectedDays] = useState<DiaSemana[]>([]);
  const [slots, setSlots] = useState<SlotDisponivel[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState("");
  const [slotToRemove, setSlotToRemove] = useState<SlotDisponivel | null>(null);
  const [loadingAgenda, setLoadingAgenda] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingSlot, setRemovingSlot] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const vetId = Number(user?.id || 0);

  const selectedDaySet = useMemo(() => new Set(selectedDays), [selectedDays]);

  const slotsByDate = useMemo(() => {
    const map: Record<string, SlotDisponivel[]> = {};

    slots.forEach((slot) => {
      const key = toDateKey(slot.dataHoraInicio);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(slot);
    });

    Object.values(map).forEach((items) => {
      items.sort((a, b) => a.dataHoraInicio.localeCompare(b.dataHoraInicio));
    });

    return map;
  }, [slots]);

  const dateKeys = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);
  const visibleSlots = selectedDateKey ? slotsByDate[selectedDateKey] || [] : [];

  const activeDaysLabel = useMemo(() => {
    if (selectedDays.length === 0) return "Nenhum dia ativo";
    return DAY_OPTIONS.filter((day) => selectedDaySet.has(day.value))
      .map((day) => day.label.slice(0, 3))
      .join(", ");
  }, [selectedDaySet, selectedDays.length]);

  useEffect(() => {
    if (dateKeys.length === 0) {
      setSelectedDateKey("");
      return;
    }

    if (!selectedDateKey || !slotsByDate[selectedDateKey]) {
      setSelectedDateKey(dateKeys[0]);
    }
  }, [dateKeys, selectedDateKey, slotsByDate]);

  const loadAgenda = useCallback(async () => {
    if (!token || !vetId) {
      setError("Faca login novamente para acessar a agenda.");
      setAgenda(null);
      setSelectedDays([]);
      setLoadingAgenda(false);
      return;
    }

    setLoadingAgenda(true);
    setError(null);

    const result = await getAgendaVeterinario(vetId, token);

    if (result.ok && result?.data?.data) {
      const agendaData = result.data.data as AgendaVeterinario;
      setAgenda(agendaData);
      setSelectedDays(parseDiasSemana(agendaData.diasSemanaAtivos));
    } else if (result.status === 404) {
      setAgenda(null);
      setSelectedDays([]);
    } else {
      setError(getApiErrorMessage(result?.data, "Nao foi possivel carregar a agenda."));
    }

    setLoadingAgenda(false);
  }, [token, vetId]);

  const loadSlots = useCallback(async () => {
    if (!token || !vetId) return;

    setLoadingSlots(true);
    const result = await getAgendaSlots(vetId, token);

    if (result.ok && Array.isArray(result?.data?.data)) {
      setSlots(filtrarSlotsHorarioAtendimento(result.data.data));
    } else {
      setSlots([]);
      setError(getApiErrorMessage(result?.data, "Nao foi possivel carregar os horarios."));
    }

    setLoadingSlots(false);
  }, [token, vetId]);

  useEffect(() => {
    void loadAgenda();
  }, [loadAgenda]);

  useEffect(() => {
    if (agenda) void loadSlots();
  }, [agenda, loadSlots]);

  function toggleDay(day: DiaSemana) {
    setNotice(null);
    setSelectedDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day]
    );
  }

  async function handleSave() {
    if (!token || !vetId) return;

    if (selectedDays.length === 0) {
      setError("Selecione pelo menos um dia de atendimento.");
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    const payload: AgendaVeterinarioPayload = {
      veterinarioId: vetId,
      diasSemanaAtivos: selectedDaysToFlags(selectedDays),
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
      setError(getApiErrorMessage(result?.data, "Nao foi possivel salvar a agenda."));
      return;
    }

    setNotice("Agenda salva. Os horarios disponiveis foram atualizados.");
    await loadAgenda();
    await loadSlots();
  }

  async function confirmRemoveSlot() {
    if (!token || !vetId || !slotToRemove) return;

    setRemovingSlot(true);
    setError(null);
    setNotice(null);

    const result = await bloquearAgendaSlot(
      {
        veterinarioId: vetId,
        dataHoraInicio: slotToRemove.dataHoraInicio,
        motivo: "Bloqueado pelo veterinario",
      },
      token
    );

    setRemovingSlot(false);

    if (!result.ok) {
      setError(getApiErrorMessage(result?.data, "Nao foi possivel remover este horario."));
      return;
    }

    const removedLabel = formatSlotTime(slotToRemove);
    setSlots((current) => current.filter((slot) => slot.dataHoraInicio !== slotToRemove.dataHoraInicio));
    setSlotToRemove(null);
    setNotice(`Horario ${removedLabel} removido deste dia.`);
    await loadSlots();
  }

  return (
    <ManagementScreen
      eyebrow="Veterinario"
      title="Minha agenda"
      subtitle="Gerencie dias de atendimento e bloqueie horarios especificos sem alterar a grade semanal."
      action={{ label: "Dashboard", icon: "arrow-back-outline", onPress: () => router.back() }}
    >
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Grade</Text>
          <Text style={styles.metricValue}>08-11 / 13-17</Text>
          <Text style={styles.metricHint}>Consultas de 60 minutos</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Dias ativos</Text>
          <Text style={styles.metricValue}>{selectedDays.length}</Text>
          <Text style={styles.metricHint}>{activeDaysLabel}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Slots visiveis</Text>
          <Text style={styles.metricValue}>{slots.length}</Text>
          <Text style={styles.metricHint}>Proximos 7 dias</Text>
        </View>
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

      <View style={managementStyles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.sectionTitle}>Disponibilidade semanal</Text>
            <Text style={styles.sectionSubtitle}>Selecione os dias em que sua agenda deve gerar horarios.</Text>
          </View>
          {loadingAgenda && <ActivityIndicator color={managementTheme.colors.accent} />}
        </View>

        <View style={styles.dayGrid}>
          {DAY_OPTIONS.map((day) => {
            const active = selectedDaySet.has(day.value);
            return (
              <TouchableOpacity
                key={day.value}
                accessibilityRole="button"
                accessibilityLabel={`Alternar ${day.label}`}
                style={[styles.dayChip, active && styles.dayChipActive]}
                onPress={() => toggleDay(day.value)}
              >
                <Text style={[styles.dayText, active && styles.dayTextActive]}>{day.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.scheduleBox}>
          <Ionicons name="time-outline" size={18} color={managementTheme.colors.accent} />
          <Text style={styles.scheduleText}>Atendimento fixo: 08:00-11:00 e 13:00-17:00</Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          style={[managementStyles.primaryButton, styles.saveButton, saving && styles.disabledButton]}
          onPress={handleSave}
          disabled={saving || loadingAgenda}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="save-outline" size={18} color="#fff" />
          )}
          <Text style={managementStyles.buttonText}>{saving ? "Salvando..." : "Salvar agenda"}</Text>
        </TouchableOpacity>
      </View>

      <View style={managementStyles.panel}>
        <View style={styles.panelHeader}>
          <View>
            <Text style={styles.sectionTitle}>Horarios disponiveis</Text>
            <Text style={styles.sectionSubtitle}>Remover um horario bloqueia apenas aquele slot daquele dia.</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            style={managementStyles.secondaryButton}
            onPress={loadSlots}
            disabled={loadingSlots}
          >
            {loadingSlots ? (
              <ActivityIndicator color={managementTheme.colors.text} />
            ) : (
              <Ionicons name="refresh-outline" size={18} color={managementTheme.colors.text} />
            )}
            <Text style={managementStyles.secondaryButtonText}>
              {loadingSlots ? "Atualizando" : "Atualizar"}
            </Text>
          </TouchableOpacity>
        </View>

        {dateKeys.length === 0 ? (
          <EmptyState
            icon="calendar-clear-outline"
            title="Nenhum horario disponivel"
            description="Salve sua disponibilidade semanal para gerar a agenda dos proximos dias."
          />
        ) : (
          <View style={styles.slotsWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateTabs}>
              {dateKeys.map((key) => {
                const active = selectedDateKey === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.dateTab, active && styles.dateTabActive]}
                    onPress={() => setSelectedDateKey(key)}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.dateText, active && styles.dateTextActive]}>{formatDateKey(key)}</Text>
                    <Text style={[styles.dateCount, active && styles.dateTextActive]}>
                      {slotsByDate[key]?.length ?? 0} horarios
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.slotGrid}>
              {visibleSlots.map((slot) => (
                <View key={slot.dataHoraInicio} style={styles.slotItem}>
                  <View style={styles.slotIcon}>
                    <Ionicons name="time-outline" size={17} color={managementTheme.colors.accent} />
                  </View>
                  <View style={styles.slotTextWrap}>
                    <Text style={styles.slotText}>{formatSlotTime(slot)}</Text>
                    <Text style={styles.slotHint}>Disponivel para solicitacoes</Text>
                  </View>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Remover horario ${formatSlotTime(slot)}`}
                    style={styles.removeButton}
                    onPress={() => setSlotToRemove(slot)}
                  >
                    <Ionicons name="close" size={18} color="#fecaca" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <Modal visible={!!slotToRemove} transparent animationType="fade" onRequestClose={() => setSlotToRemove(null)}>
        <View style={managementStyles.modalOverlay}>
          <View style={managementStyles.modalCard}>
            <View style={styles.modalIcon}>
              <Ionicons name="calendar-clear-outline" size={22} color="#fecaca" />
            </View>
            <Text style={managementStyles.modalTitle}>Remover horario</Text>
            <Text style={managementStyles.infoText}>
              O horario {formatSlotTime(slotToRemove)} ficara indisponivel para novas solicitacoes neste dia.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={managementStyles.secondaryButton}
                onPress={() => setSlotToRemove(null)}
                disabled={removingSlot}
              >
                <Text style={managementStyles.secondaryButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dangerButton, removingSlot && styles.disabledButton]}
                onPress={confirmRemoveSlot}
                disabled={removingSlot}
              >
                {removingSlot ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                )}
                <Text style={styles.dangerButtonText}>{removingSlot ? "Removendo..." : "Remover horario"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ManagementScreen>
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
    minWidth: 210,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: managementTheme.colors.surface,
    borderRadius: managementTheme.radii.lg,
    padding: 16,
  },
  metricLabel: {
    color: managementTheme.colors.textSubtle,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricValue: {
    color: managementTheme.colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 6,
  },
  metricHint: {
    color: managementTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
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
  panelHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
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
    lineHeight: 19,
    marginTop: 3,
  },
  dayGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayChip: {
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 13,
    backgroundColor: "rgba(15,23,42,0.58)",
  },
  dayChipActive: {
    borderColor: managementTheme.colors.primary,
    backgroundColor: managementTheme.colors.primary,
  },
  dayText: {
    color: managementTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
  dayTextActive: {
    color: "#fff",
  },
  scheduleBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: managementTheme.colors.surfaceMuted,
    borderRadius: managementTheme.radii.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  scheduleText: {
    color: managementTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
  saveButton: {
    alignSelf: "flex-start",
    minWidth: 164,
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.62,
  },
  slotsWrap: {
    gap: 12,
  },
  dateTabs: {
    gap: 8,
    paddingBottom: 4,
  },
  dateTab: {
    minWidth: 128,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    borderRadius: managementTheme.radii.md,
    backgroundColor: "rgba(15,23,42,0.58)",
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  dateTabActive: {
    borderColor: managementTheme.colors.accent,
    backgroundColor: managementTheme.colors.primarySoft,
  },
  dateText: {
    color: managementTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  dateTextActive: {
    color: managementTheme.colors.text,
  },
  dateCount: {
    color: managementTheme.colors.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  slotGrid: {
    gap: 9,
  },
  slotItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: managementTheme.colors.surfaceMutedStrong,
    borderRadius: managementTheme.radii.md,
    padding: 11,
  },
  slotIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(56,189,248,0.12)",
  },
  slotTextWrap: {
    flex: 1,
  },
  slotText: {
    color: managementTheme.colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  slotHint: {
    color: managementTheme.colors.textSubtle,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  removeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.28)",
    backgroundColor: managementTheme.colors.dangerSoft,
  },
  modalIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: managementTheme.colors.dangerSoft,
    borderWidth: 1,
    borderColor: "rgba(248,113,113,0.28)",
  },
  modalActions: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
  dangerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: managementTheme.colors.danger,
    borderRadius: managementTheme.radii.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dangerButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
  },
});
