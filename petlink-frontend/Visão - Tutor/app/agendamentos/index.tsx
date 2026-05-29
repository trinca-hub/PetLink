import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { AuthContext } from "@/src/context/AuthContext";
import { getAgendamentosTutor } from "@/src/api/agendamentoService";
import { getMyPetsService } from "@/src/api/authService";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import { AgendamentoConsulta, StatusAgendamento } from "@/src/types/agendamento";

const FILTERS: Array<StatusAgendamento | "Todos"> = [
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

export default function AgendamentosScreen() {
  const { token } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agendamentos, setAgendamentos] = useState<AgendamentoConsulta[]>([]);
  const [filter, setFilter] = useState<StatusAgendamento | "Todos">("Todos");
  const [petMap, setPetMap] = useState<Record<number, string>>({});

  async function loadData() {
    if (!token) {
      setError("Faça login para visualizar seus agendamentos.");
      setAgendamentos([]);
      return;
    }

    setError(null);

    const [agendamentosRes, petsRes]: any = await Promise.all([
      getAgendamentosTutor(token),
      getMyPetsService(token),
    ]);

    if (agendamentosRes?.ok && Array.isArray(agendamentosRes?.data?.data)) {
      setAgendamentos(agendamentosRes.data.data);
    } else {
      setAgendamentos([]);
      setError(getApiErrorMessage(agendamentosRes?.data, "Não foi possível carregar agendamentos."));
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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        setLoading(true);
        await loadData();
        if (isActive) setLoading(false);
      })();
      return () => {
        isActive = false;
      };
    }, [token])
  );

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  const filtered = useMemo(() => {
    if (filter === "Todos") return agendamentos;
    return agendamentos.filter((item) => item.status === filter);
  }, [agendamentos, filter]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B0B0F" }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.75)", fontWeight: "800" }}>
          Carregando agendamentos...
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

        <Pressable
          onPress={() => router.push("/perfil")}
          style={{ width: 40, height: 40, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="person" size={20} color="#fff" />
        </Pressable>
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
          Agendamentos
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, marginTop: 12, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {FILTERS.map((item) => {
          const active = filter === item;
          return (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: active ? "#fff" : "rgba(255,255,255,0.35)",
                backgroundColor: active ? "#fff" : "transparent",
              }}
            >
              <Text style={{ color: active ? "#0B0B0F" : "#fff", fontWeight: "800", fontSize: 12 }}>
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {!!error && (
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <Text style={{ color: "#ffb4b4", fontWeight: "800" }}>{error}</Text>
        </View>
      )}

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 26 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        ListEmptyComponent={() => (
          <View style={{ paddingTop: 24 }}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>Nenhum agendamento encontrado</Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
              Suas consultas aparecerão aqui quando forem solicitadas.
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/agendamentos/${item.id}`)}
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: 14,
              marginBottom: 10,
              shadowOpacity: 0.1,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 6 },
              elevation: 3,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: "#111", fontWeight: "900", fontSize: 16 }}>
                Consulta #{item.id}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#0E2B5A" />
            </View>

            <Text style={{ marginTop: 6, color: "#444", fontWeight: "700" }}>
              Pet: {petMap[item.petId] || `ID ${item.petId}`}
            </Text>
            <Text style={{ marginTop: 4, color: "#444", fontWeight: "700" }}>
              Status: {item.status}
            </Text>
            <Text style={{ marginTop: 4, color: "#444", fontWeight: "700" }}>
              Horário: {formatDateTime(item.dataHoraInicio)}
            </Text>
          </Pressable>
        )}
      />
    </LinearGradient>
  );
}
