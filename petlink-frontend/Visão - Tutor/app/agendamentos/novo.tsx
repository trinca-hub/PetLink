import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";

import { AuthContext } from "@/src/context/AuthContext";
import { createAgendamento, getVeterinarios } from "@/src/api/agendamentoService";
import {
  filtrarSlotsHorarioAtendimento,
  getAgendaSlots,
  isDataHoraDentroHorarioAtendimento,
} from "@/src/api/agendaVeterinarioService";
import { getMyPetsService } from "@/src/api/authService";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import { SlotDisponivel } from "@/src/types/agendamento";
import { TutorPalette } from "@/constants/theme";

type Pet = { id: number; nome?: string };
type Vet = { id: number; nome?: string; crmv?: string };

type SlotGroup = {
  key: string;
  title: string;
  items: SlotDisponivel[];
};

function formatDateTitle(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data invalida";
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });
}

function formatSlot(slot: SlotDisponivel) {
  const start = new Date(slot.dataHoraInicio);
  const end = new Date(slot.dataHoraFim);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Horario invalido";

  const timeOptions: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit" };
  return `${start.toLocaleTimeString("pt-BR", timeOptions)} - ${end.toLocaleTimeString("pt-BR", timeOptions)}`;
}

function dateKey(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

export default function NovoAgendamento() {
  const { token } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pets, setPets] = useState<Pet[]>([]);
  const [vets, setVets] = useState<Vet[]>([]);
  const [slots, setSlots] = useState<SlotDisponivel[]>([]);
  const [petId, setPetId] = useState<number | null>(null);
  const [vetId, setVetId] = useState<number | null>(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedVet = useMemo(() => vets.find((item) => item.id === vetId), [vets, vetId]);

  const slotGroups = useMemo<SlotGroup[]>(() => {
    const map: Record<string, SlotGroup> = {};

    slots.forEach((slot) => {
      const key = dateKey(slot.dataHoraInicio);
      if (!map[key]) {
        map[key] = {
          key,
          title: formatDateTitle(slot.dataHoraInicio),
          items: [],
        };
      }
      map[key].items.push(slot);
    });

    return Object.values(map)
      .map((group) => ({
        ...group,
        items: group.items.sort((a, b) => a.dataHoraInicio.localeCompare(b.dataHoraInicio)),
      }))
      .sort((a, b) => a.key.localeCompare(b.key));
  }, [slots]);

  const loadSlots = useCallback(
    async (veterinarioId: number) => {
      if (!token) return;

      setLoadingSlots(true);
      setSelectedSlot("");
      const result: any = await getAgendaSlots(veterinarioId, token);

      if (result?.ok && Array.isArray(result?.data?.data)) {
        setSlots(filtrarSlotsHorarioAtendimento(result.data.data));
      } else {
        setSlots([]);
        setError(getApiErrorMessage(result?.data, "Nao foi possivel carregar os horarios deste veterinario."));
      }

      setLoadingSlots(false);
    },
    [token]
  );

  const loadInitialData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      setError("Faca login para solicitar uma consulta.");
      return;
    }

    setError(null);
    const [petsResult, vetsResult]: any = await Promise.all([
      getMyPetsService(token),
      getVeterinarios(token),
    ]);

    const petList = petsResult?.ok && Array.isArray(petsResult?.data?.data) ? petsResult.data.data : [];
    const vetList = vetsResult?.ok && Array.isArray(vetsResult?.data?.data) ? vetsResult.data.data : [];

    setPets(petList);
    setVets(vetList);
    setPetId((current) => (current && petList.some((pet: Pet) => pet.id === current) ? current : petList[0]?.id ?? null));
    setVetId((current) => (current && vetList.some((vet: Vet) => vet.id === current) ? current : vetList[0]?.id ?? null));

    if (!petsResult?.ok) {
      setError(getApiErrorMessage(petsResult?.data, "Nao foi possivel carregar seus pets."));
    } else if (!vetsResult?.ok) {
      setError(getApiErrorMessage(vetsResult?.data, "Nao foi possivel carregar os veterinarios."));
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    if (vetId) {
      void loadSlots(vetId);
    } else {
      setSlots([]);
      setSelectedSlot("");
    }
  }, [loadSlots, vetId]);

  async function onRefresh() {
    setRefreshing(true);
    await loadInitialData();
    if (vetId) await loadSlots(vetId);
    setRefreshing(false);
  }

  async function handleSubmit() {
    if (!token) {
      setError("Faca login para solicitar uma consulta.");
      return;
    }

    if (!petId || !vetId || !selectedSlot) {
      setError("Selecione pet, veterinario e horario para continuar.");
      return;
    }

    if (!isDataHoraDentroHorarioAtendimento(selectedSlot)) {
      setError("O horario deve estar entre 08:00-11:00 ou 13:00-17:00.");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await createAgendamento(
      {
        petId,
        veterinarioId: vetId,
        tipoServico: 1,
        dataHoraInicio: selectedSlot,
        observacao: observacao.trim() || undefined,
      },
      token
    );

    setSaving(false);

    if (!result.ok) {
      setError(getApiErrorMessage(result?.data, "Nao foi possivel solicitar a consulta."));
      return;
    }

    Alert.alert("Solicitacao enviada", "O veterinario podera aceitar, recusar ou sugerir outro horario.");
    router.replace("/agendamentos");
  }

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Carregando consulta...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={[TutorPalette.background, TutorPalette.backgroundSecondary]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={styles.eyebrow}>Consulta veterinaria</Text>
            <Text style={styles.title}>Solicitar atendimento</Text>
          </View>
          <View style={styles.iconSpacer} />
        </View>

        <View style={styles.summaryCard}>
          <Ionicons name="calendar-outline" size={22} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Escolha pet, veterinario e horario</Text>
            <Text style={styles.summaryText}>
              A consulta ficara pendente ate o veterinario aceitar, recusar ou sugerir outra data.
            </Text>
          </View>
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pet atendido</Text>
          {pets.length === 0 ? (
            <Text style={styles.emptyText}>Cadastre um pet antes de solicitar uma consulta.</Text>
          ) : (
            <View style={styles.chipGrid}>
              {pets.map((pet) => {
                const active = petId === pet.id;
                return (
                  <Pressable
                    key={pet.id}
                    onPress={() => setPetId(pet.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {pet.nome || `Pet ${pet.id}`}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Veterinario</Text>
          {vets.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum veterinario disponivel no momento.</Text>
          ) : (
            <View style={styles.vetList}>
              {vets.map((vet) => {
                const active = vetId === vet.id;
                return (
                  <Pressable
                    key={vet.id}
                    onPress={() => setVetId(vet.id)}
                    style={[styles.vetItem, active && styles.vetItemActive]}
                  >
                    <View style={styles.vetAvatar}>
                      <Ionicons name="medical-outline" size={18} color={active ? TutorPalette.background : "#fff"} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.vetName, active && styles.darkText]}>{vet.nome || `Veterinario ${vet.id}`}</Text>
                      {!!vet.crmv && <Text style={[styles.vetMeta, active && styles.darkMeta]}>CRMV {vet.crmv}</Text>}
                    </View>
                    {active && <Ionicons name="checkmark-circle" size={20} color={TutorPalette.background} />}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Horarios disponiveis</Text>
            {!!selectedVet && <Text style={styles.smallPill}>{selectedVet.nome || "Vet selecionado"}</Text>}
          </View>

          {loadingSlots ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.emptyText}>Buscando agenda...</Text>
            </View>
          ) : slotGroups.length === 0 ? (
            <Text style={styles.emptyText}>Este veterinario ainda nao possui horarios disponiveis.</Text>
          ) : (
            <View style={styles.slotGroups}>
              {slotGroups.map((group) => (
                <View key={group.key} style={styles.slotGroup}>
                  <Text style={styles.slotGroupTitle}>{group.title}</Text>
                  <View style={styles.slotGrid}>
                    {group.items.map((slot) => {
                      const active = selectedSlot === slot.dataHoraInicio;
                      return (
                        <Pressable
                          key={slot.dataHoraInicio}
                          onPress={() => setSelectedSlot(slot.dataHoraInicio)}
                          style={[styles.slotButton, active && styles.slotButtonActive]}
                        >
                          <Text style={[styles.slotText, active && styles.slotTextActive]}>{formatSlot(slot)}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Observacao</Text>
          <TextInput
            value={observacao}
            onChangeText={setObservacao}
            placeholder="Ex: sintomas, comportamento ou motivo da consulta"
            placeholderTextColor="rgba(255,255,255,0.55)"
            multiline
            style={styles.input}
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={saving || !petId || !vetId || !selectedSlot}
          style={[styles.submitButton, (saving || !petId || !vetId || !selectedSlot) && styles.submitButtonDisabled]}
        >
          <Text style={styles.submitText}>{saving ? "Enviando..." : "Enviar solicitacao"}</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: TutorPalette.background,
  },
  loadingText: {
    marginTop: 10,
    color: "rgba(255,255,255,0.76)",
    fontWeight: "800",
  },
  content: {
    padding: 16,
    paddingBottom: 28,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  iconSpacer: { width: 42, height: 42 },
  headerTextWrap: { flex: 1, alignItems: "center" },
  eyebrow: {
    color: TutorPalette.muted,
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    color: TutorPalette.text,
    fontSize: 20,
    fontWeight: "900",
  },
  summaryCard: {
    flexDirection: "row",
    gap: 12,
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: TutorPalette.border,
  },
  summaryTitle: {
    color: TutorPalette.text,
    fontSize: 15,
    fontWeight: "900",
  },
  summaryText: {
    color: TutorPalette.muted,
    marginTop: 3,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  card: {
    borderRadius: 18,
    padding: 14,
    gap: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: TutorPalette.border,
  },
  sectionTitle: {
    color: TutorPalette.text,
    fontSize: 15,
    fontWeight: "900",
  },
  errorText: {
    color: TutorPalette.danger,
    fontWeight: "900",
  },
  emptyText: {
    color: TutorPalette.muted,
    fontWeight: "700",
    lineHeight: 19,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 13,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: TutorPalette.border,
  },
  chipActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  chipText: {
    color: TutorPalette.text,
    fontWeight: "900",
  },
  chipTextActive: {
    color: TutorPalette.background,
  },
  vetList: { gap: 8 },
  vetItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 16,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: TutorPalette.border,
  },
  vetItemActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  vetAvatar: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(14,43,90,0.18)",
  },
  vetName: {
    color: TutorPalette.text,
    fontSize: 14,
    fontWeight: "900",
  },
  vetMeta: {
    color: TutorPalette.muted,
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
  },
  darkText: { color: TutorPalette.background },
  darkMeta: { color: "#2b3a50" },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  smallPill: {
    maxWidth: "52%",
    color: TutorPalette.background,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 11,
    fontWeight: "900",
  },
  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  slotGroups: { gap: 12 },
  slotGroup: { gap: 8 },
  slotGroupTitle: {
    color: TutorPalette.text,
    fontSize: 13,
    fontWeight: "900",
    textTransform: "capitalize",
  },
  slotGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  slotButton: {
    minWidth: 112,
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: TutorPalette.border,
    alignItems: "center",
  },
  slotButtonActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  slotText: {
    color: TutorPalette.text,
    fontWeight: "900",
    fontSize: 12,
  },
  slotTextActive: {
    color: TutorPalette.background,
  },
  input: {
    minHeight: 88,
    borderRadius: 14,
    padding: 12,
    color: TutorPalette.text,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: TutorPalette.border,
    textAlignVertical: "top",
    fontWeight: "700",
  },
  submitButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  submitButtonDisabled: {
    opacity: 0.48,
  },
  submitText: {
    color: TutorPalette.background,
    fontWeight: "900",
    fontSize: 14,
  },
});
