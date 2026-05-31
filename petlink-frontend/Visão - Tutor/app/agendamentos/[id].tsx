import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";

import { AuthContext } from "@/src/context/AuthContext";
import {
  cancelarAgendamento,
  confirmarAgendamento,
  getAgendamentoById,
} from "@/src/api/agendamentoService";
import { getAgendaSlots } from "@/src/api/agendaVeterinarioService";
import { getMyPetsService } from "@/src/api/authService";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import { AgendamentoConsulta, SlotDisponivel, TIPO_SERVICO_LABEL } from "@/src/types/agendamento";

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function formatTipoServico(value?: number | null) {
  if (!value) return "-";
  return TIPO_SERVICO_LABEL[value] || `Tipo ${value}`;
}

function slotLabel(slot: SlotDisponivel) {
  const start = new Date(slot.dataHoraInicio);
  const end = new Date(slot.dataHoraFim);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Horário inválido";
  const date = start.toLocaleDateString("pt-BR");
  const startTime = start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const endTime = end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${date} • ${startTime} - ${endTime}`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function toDateKey(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function formatDateKey(key: string) {
  const [year, month, day] = key.split("-").map((p) => Number(p));
  if (!year || !month || !day) return key;
  const d = new Date(year, month - 1, day);
  if (Number.isNaN(d.getTime())) return key;
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" });
}

function formatSlotTime(slot: SlotDisponivel) {
  const start = new Date(slot.dataHoraInicio);
  const end = new Date(slot.dataHoraFim);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "Horário inválido";
  const startTime = start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const endTime = end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  return `${startTime} - ${endTime}`;
}

export default function AgendamentoDetalheScreen() {
  const { token } = useContext(AuthContext);
  const params = useLocalSearchParams<{ id?: string }>();
  const id = useMemo(() => Number(params.id), [params.id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agendamento, setAgendamento] = useState<AgendamentoConsulta | null>(null);
  const [slots, setSlots] = useState<SlotDisponivel[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [selectedDateKey, setSelectedDateKey] = useState<string>("");
  const [petMap, setPetMap] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const slotsByDate = useMemo(() => {
    const map: Record<string, SlotDisponivel[]> = {};
    slots.forEach((slot) => {
      const key = toDateKey(slot.dataHoraInicio);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(slot);
    });

    Object.values(map).forEach((list) => {
      list.sort((a, b) => (a.dataHoraInicio || "").localeCompare(b.dataHoraInicio || ""));
    });

    return map;
  }, [slots]);

  const dateKeys = useMemo(() => Object.keys(slotsByDate).sort(), [slotsByDate]);

  useEffect(() => {
    if (dateKeys.length === 0) {
      setSelectedDateKey("");
      setSelectedSlot("");
      return;
    }

    if (!selectedDateKey || !slotsByDate[selectedDateKey]) {
      setSelectedDateKey(dateKeys[0]);
      setSelectedSlot("");
    }
  }, [dateKeys, selectedDateKey, slotsByDate]);

  async function load() {
    if (!token) {
      setError("Faça login para visualizar este agendamento.");
      setAgendamento(null);
      return;
    }

    setError(null);

    const [agendamentoRes, petsRes]: any = await Promise.all([
      getAgendamentoById(id, token),
      getMyPetsService(token),
    ]);

    if (agendamentoRes?.ok) {
      setAgendamento(agendamentoRes?.data?.data ?? null);
    } else {
      setError(getApiErrorMessage(agendamentoRes?.data, "Não foi possível carregar o agendamento."));
      setAgendamento(null);
      return;
    }

    if (petsRes?.ok) {
      const list = Array.isArray(petsRes?.data?.data) ? petsRes.data.data : [];
      const map: Record<number, string> = {};
      list.forEach((pet: any) => {
        if (pet?.id) map[Number(pet.id)] = String(pet.nome || `Pet ${pet.id}`);
      });
      setPetMap(map);
    }
  }

  async function loadSlots(vetId: number) {
    if (!token) return;
    const slotsRes: any = await getAgendaSlots(vetId, token);
    if (slotsRes?.ok && Array.isArray(slotsRes?.data?.data)) {
      setSlots(slotsRes.data.data);
    } else if (!slotsRes?.ok) {
      setError(getApiErrorMessage(slotsRes?.data, "Não foi possível carregar os horários disponíveis."));
    }
  }

  useEffect(() => {
    (async () => {
      if (!id || Number.isNaN(id)) {
        setError("ID inválido.");
        setLoading(false);
        return;
      }

      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [id, token]);

  useEffect(() => {
    if (agendamento?.veterinarioId && agendamento.status === "Pendente") {
      loadSlots(agendamento.veterinarioId);
    }
  }, [agendamento?.veterinarioId, agendamento?.status]);

  async function handleConfirm() {
    if (!token || !agendamento) return;

    if (!selectedSlot) {
      setError("Selecione um horário para confirmar.");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await confirmarAgendamento(
      agendamento.id,
      { dataHoraInicio: selectedSlot },
      token
    );

    setSaving(false);

    if (!result.ok) {
      setError(getApiErrorMessage(result?.data, "Não foi possível confirmar o agendamento."));
      return;
    }

    await load();
  }

  async function handleCancel() {
    if (!token || !agendamento) return;

    setSaving(true);
    setError(null);

    const payload = cancelReason.trim() ? { motivo: cancelReason.trim() } : null;
    const result = await cancelarAgendamento(agendamento.id, payload, token);

    setSaving(false);
    setCancelModalOpen(false);

    if (!result.ok) {
      setError(getApiErrorMessage(result?.data, "Não foi possível cancelar o agendamento."));
      return;
    }

    setCancelReason("");
    await load();
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B0B0F" }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.75)", fontWeight: "800" }}>
          Carregando agendamento...
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={["#0B0B0F", "#0E2B5A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        <View
          style={{
            paddingTop: 14,
            paddingHorizontal: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
          >
            <Feather name="arrow-left" size={22} color="#fff" />
          </Pressable>

          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>PetLink</Text>

          <View style={{ width: 40, height: 40 }} />
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 6 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 18,
              fontWeight: "900",
              textAlign: "center",
              textDecorationLine: "underline",
              textDecorationColor: "#fff",
            }}
          >
            Consulta #{agendamento?.id ?? id}
          </Text>
        </View>

        {!!error && (
          <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
            <Text style={{ color: "#ffb4b4", fontWeight: "800" }}>{error}</Text>
          </View>
        )}

        <View style={{ paddingHorizontal: 16, marginTop: 12, gap: 12 }}>
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.12)",
            borderRadius: 14,
            paddingVertical: 12,
            paddingHorizontal: 14,
            gap: 4,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>Pet: {petMap[agendamento?.petId ?? 0] || `ID ${agendamento?.petId}`}</Text>
          <Text style={{ color: "#fff", fontWeight: "800" }}>Status: {agendamento?.status}</Text>
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            Tipo: {formatTipoServico(agendamento?.tipoServico)}
          </Text>
          <Text style={{ color: "#fff", fontWeight: "800" }}>Horário: {formatDateTime(agendamento?.dataHoraInicio)}</Text>
          {agendamento?.observacao ? (
            <Text style={{ color: "#fff", fontWeight: "800" }}>Obs: {agendamento.observacao}</Text>
          ) : null}
          {agendamento?.motivoCancelamento ? (
            <Text style={{ color: "#ffd1d1", fontWeight: "800" }}>Motivo: {agendamento.motivoCancelamento}</Text>
          ) : null}
        </View>

        {agendamento?.status === "Pendente" && (
          <View
            style={{
              backgroundColor: "rgba(255,255,255,0.12)",
              borderRadius: 14,
              paddingVertical: 12,
              paddingHorizontal: 14,
              gap: 10,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "900" }}>Horários disponíveis</Text>

            {dateKeys.length === 0 ? (
              <Text style={{ color: "rgba(255,255,255,0.75)", fontWeight: "700" }}>
                Nenhum horário disponível no momento.
              </Text>
            ) : (
              <View style={{ gap: 12 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
                >
                  {dateKeys.map((key) => {
                    const active = selectedDateKey === key;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => {
                          setSelectedDateKey(key);
                          setSelectedSlot("");
                        }}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: active ? "#fff" : "rgba(255,255,255,0.35)",
                          backgroundColor: active ? "#fff" : "transparent",
                        }}
                      >
                        <Text style={{ color: active ? "#0B0B0F" : "#fff", fontWeight: "800", fontSize: 12 }}>
                          {formatDateKey(key)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>

                <View style={{ gap: 8, maxHeight: 220 }}>
                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {(slotsByDate[selectedDateKey] || []).map((slot, index) => {
                      const value = slot.dataHoraInicio;
                      const active = selectedSlot === value;
                      return (
                        <Pressable
                          key={value || `slot-${index}`}
                          onPress={() => setSelectedSlot(value)}
                          style={{
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: active ? "#fff" : "rgba(255,255,255,0.35)",
                            backgroundColor: active ? "#fff" : "transparent",
                          }}
                        >
                          <Text style={{ color: active ? "#0B0B0F" : "#fff", fontWeight: "800" }}>
                            {formatSlotTime(slot)}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            )}

            <Pressable
              onPress={handleConfirm}
              disabled={saving}
              style={{
                marginTop: 8,
                backgroundColor: "#fff",
                paddingVertical: 12,
                borderRadius: 999,
                alignItems: "center",
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#0B0B0F", fontWeight: "900" }}>
                {saving ? "Confirmando..." : "Confirmar consulta"}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setCancelModalOpen(true)}
              disabled={saving}
              style={{
                marginTop: 6,
                borderColor: "#fff",
                borderWidth: 1,
                paddingVertical: 10,
                borderRadius: 999,
                alignItems: "center",
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>Cancelar consulta</Text>
            </Pressable>
          </View>
        )}
        </View>
      </ScrollView>

      <Modal transparent visible={cancelModalOpen} animationType="fade" onRequestClose={() => setCancelModalOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 18 }}>
          <View style={{ backgroundColor: "#0f253e", borderRadius: 16, padding: 16, gap: 10 }}>
            <Text style={{ color: "#edf4ff", fontSize: 18, fontWeight: "700" }}>Cancelar consulta</Text>
            <Text style={{ color: "#b7c8e8", fontSize: 13 }}>
              Informe um motivo (opcional) para cancelar.
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: "rgba(138,180,248,0.25)",
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: "#eaf2ff",
                backgroundColor: "rgba(20, 56, 99, 0.45)",
                minHeight: 70,
                textAlignVertical: "top",
              }}
              placeholder="Motivo do cancelamento"
              placeholderTextColor="#98abc9"
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
              <Pressable
                onPress={() => setCancelModalOpen(false)}
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "rgba(138,180,248,0.35)",
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                }}
              >
                <Text style={{ color: "#dbe9ff", fontWeight: "700" }}>Voltar</Text>
              </Pressable>
              <Pressable
                onPress={handleCancel}
                style={{ borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#c73939" }}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}
