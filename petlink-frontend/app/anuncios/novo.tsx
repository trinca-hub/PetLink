import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { AuthContext } from "@/src/context/AuthContext";
import { api } from "@/src/api/api";
import { getMyPetsService } from "@/src/api/authService";

type TipoTela = "petinder" | "petfinder" | "paypet";

type Pet = {
  id: number;
  nome?: string;
  fotoPet?: string;
  raca?: string;
  idade?: number;
  sexo?: string;
};

function mapTipoToTitulo(tipo: TipoTela) {
  if (tipo === "petfinder") return "PetFinder";
  if (tipo === "paypet") return "PayPet";
  return "PeTinder";
}

// ⚠️ Se seu backend usar outro enum, ajuste aqui.
function mapTipoToApiEnum(tipo: TipoTela) {
  // 1=PeTinder, 2=PetFinder, 3=PayPet
  if (tipo === "petfinder") return 2;
  if (tipo === "paypet") return 3;
  return 1;
}

function formatDateBR(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function NovoAnuncio() {
  const { token, user } = useContext(AuthContext);
  const params = useLocalSearchParams<{ tipo?: string }>();

  const tipo = useMemo<TipoTela>(() => {
    const t = String(params.tipo ?? "petinder").toLowerCase();
    if (t === "petfinder") return "petfinder";
    if (t === "paypet") return "paypet";
    return "petinder";
  }, [params.tipo]);

  const titulo = useMemo(() => mapTipoToTitulo(tipo), [tipo]);

  const [pets, setPets] = useState<Pet[]>([]);
  const [loadingPets, setLoadingPets] = useState(true);

  const [petSelecionadoId, setPetSelecionadoId] = useState<number | null>(null);
  const [descricao, setDescricao] = useState("");

  // campos extras
  const [ultimoLocalVisto, setUltimoLocalVisto] = useState("");

  // ✅ DatePicker PetFinder
  const [dataDesaparecimento, setDataDesaparecimento] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  const [tipoPayPet, setTipoPayPet] = useState<string>("");
  const [valor, setValor] = useState<string>("");

  const [posting, setPosting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoadingPets(true);

        if (!token) {
          setPets([]);
          return;
        }

        const res: any = await getMyPetsService(token);

        if (!res?.ok) {
          console.log("[NOVO ANUNCIO] erro ao carregar pets:", res?.status, res?.data);
          setPets([]);
          return;
        }

        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data)
            ? res.data
            : [];

        setPets(list);

        if (list?.length > 0) setPetSelecionadoId(list[0].id);
      } finally {
        setLoadingPets(false);
      }
    })();
  }, [token]);

  function validate() {
    if (!user?.id) return "Usuário não carregado. Faça login novamente.";
    if (!petSelecionadoId) return "Selecione um pet.";
    if (!descricao.trim()) return "Escreva uma descrição.";

    if (tipo === "petfinder") {
      if (!ultimoLocalVisto.trim()) return "Informe o último local visto.";
      if (!dataDesaparecimento) return "Informe a data de desaparecimento.";
    }

    if (tipo === "paypet") {
      if (!tipoPayPet.trim() || Number.isNaN(Number(tipoPayPet))) return "Informe o tipo do PayPet (número).";
      if (!valor.trim() || Number.isNaN(Number(valor))) return "Informe o valor (número).";
    }

    return null;
  }

  async function publicar() {
    const err = validate();
    if (err) {
      Alert.alert("Atenção", err);
      return;
    }

    setPosting(true);

    const tipoAnuncio = mapTipoToApiEnum(tipo);

    const body: any = {
      descricao: descricao.trim(),
      tipoAnuncio,
      usuarioId: user!.id,
      criadorId: user!.id,

      payPet: null,
      petFinder: null,
      peTinder: null,
    };

    if (tipo === "petinder") {
      body.peTinder = { petId: petSelecionadoId };
    }

    if (tipo === "petfinder") {
      // ✅ ISO com meia-noite (evita timezone zoar o dia)
      const d = dataDesaparecimento!;
      const iso = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0).toISOString();

      body.petFinder = {
        petId: petSelecionadoId,
        ultimoLocalVisto: ultimoLocalVisto.trim(),
        dataDesaparecimento: iso,
      };
    }

    if (tipo === "paypet") {
      body.payPet = {
        petId: petSelecionadoId,
        tipoPayPet: Number(tipoPayPet),
        valor: Number(valor),
      };
    }

    const res: any = await api("Anuncio", "POST", body, token || undefined);
    setPosting(false);

    if (!res?.ok) {
      console.log("[NOVO ANUNCIO] POST erro:", res?.status, res?.data);
      Alert.alert("Erro ao publicar", res?.data?.message || "Não foi possível criar o anúncio.");
      return;
    }

    Alert.alert("Sucesso", "Anúncio publicado!");
    router.back();
  }

  return (
    <LinearGradient
      colors={["#0B0B0F", "#0E2B5A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      {/* Header */}
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
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>

        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>
          Novo anúncio • {titulo}
        </Text>

        <View style={{ width: 40, height: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {/* Selecionar pet */}
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: "rgba(255,255,255,0.95)", fontWeight: "900", marginBottom: 10 }}>
            Selecione um pet
          </Text>

          {loadingPets ? (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <ActivityIndicator color="#fff" />
              <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.75)" }}>
                Carregando seus pets...
              </Text>
            </View>
          ) : pets.length === 0 ? (
            <View
              style={{
                backgroundColor: "rgba(255,255,255,0.12)",
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.18)",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900" }}>Você não tem pets cadastrados.</Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
                Cadastre um pet para poder criar anúncios.
              </Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {pets.map((p) => {
                const selected = p.id === petSelecionadoId;
                return (
                  <Pressable
                    key={p.id}
                    onPress={() => setPetSelecionadoId(p.id)}
                    style={{
                      backgroundColor: selected ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.10)",
                      borderRadius: 18,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: selected ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.18)",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <View
                      style={{
                        width: 62,
                        height: 62,
                        borderRadius: 16,
                        overflow: "hidden",
                        backgroundColor: "#EEE",
                      }}
                    >
                      {!!p.foto ? (
                        <Image
                          source={{ uri: p.foto }}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                          <Ionicons name="paw" size={24} color="#999" />
                        </View>
                      )}

                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
                        {p.nome || `Pet #${p.id}`}
                      </Text>
                      <Text style={{ color: "rgba(255,255,255,0.80)", marginTop: 4, fontWeight: "700" }}>
                        {p.raca || "Raça não informada"}
                      </Text>
                    </View>

                    {selected && <Ionicons name="checkmark-circle" size={22} color="#fff" />}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* Descrição */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: "rgba(255,255,255,0.95)", fontWeight: "900", marginBottom: 8 }}>
            Descrição
          </Text>

          <View style={{ backgroundColor: "#fff", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10 }}>
            <TextInput
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Escreva a descrição do anúncio..."
              placeholderTextColor="#8E8E93"
              multiline
              style={{
                color: "#111",
                fontWeight: "700",
                minHeight: 110,
                textAlignVertical: "top",
              }}
            />
          </View>
        </View>

        {/* Campos extras PetFinder */}
        {tipo === "petfinder" && (
          <>
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.95)", fontWeight: "900", marginBottom: 8 }}>
                Último local visto
              </Text>

              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="location" size={18} color="#0E2B5A" />
                <TextInput
                  value={ultimoLocalVisto}
                  onChangeText={setUltimoLocalVisto}
                  placeholder="Ex: Parque da cidade"
                  placeholderTextColor="#8E8E93"
                  style={{ flex: 1, color: "#111", fontWeight: "700" }}
                />
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.95)", fontWeight: "900", marginBottom: 8 }}>
                Data de desaparecimento
              </Text>

              <Pressable
                onPress={() => setShowPicker(true)}
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 999,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <Ionicons name="calendar" size={18} color="#0E2B5A" />
                  <Text style={{ color: dataDesaparecimento ? "#111" : "#8E8E93", fontWeight: "800" }}>
                    {dataDesaparecimento ? formatDateBR(dataDesaparecimento) : "Selecione a data"}
                  </Text>
                </View>

                <Ionicons name="chevron-down" size={18} color="#0E2B5A" />
              </Pressable>

              {showPicker && (
                <DateTimePicker
                  value={dataDesaparecimento ?? new Date()}
                  mode="date"
                  display="calendar"
                  maximumDate={new Date()} // ✅ não deixa selecionar futuro
                  onChange={(event, selected) => {
                    setShowPicker(false);
                    if (event.type === "dismissed") return;
                    if (selected) setDataDesaparecimento(selected);
                  }}
                />
              )}
            </View>
          </>
        )}

        {/* Campos extras PayPet */}
        {tipo === "paypet" && (
          <>
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.95)", fontWeight: "900", marginBottom: 8 }}>
                Tipo do PayPet (número)
              </Text>

              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="list" size={18} color="#0E2B5A" />
                <TextInput
                  value={tipoPayPet}
                  onChangeText={setTipoPayPet}
                  keyboardType="numeric"
                  placeholder="Ex: 1"
                  placeholderTextColor="#8E8E93"
                  style={{ flex: 1, color: "#111", fontWeight: "700" }}
                />
              </View>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.95)", fontWeight: "900", marginBottom: 8 }}>
                Valor
              </Text>

              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="cash" size={18} color="#0E2B5A" />
                <TextInput
                  value={valor}
                  onChangeText={setValor}
                  keyboardType="numeric"
                  placeholder="Ex: 150"
                  placeholderTextColor="#8E8E93"
                  style={{ flex: 1, color: "#111", fontWeight: "700" }}
                />
              </View>
            </View>
          </>
        )}

        {/* Botão publicar */}
        <Pressable
          disabled={posting || loadingPets || pets.length === 0}
          onPress={publicar}
          style={{
            marginTop: 18,
            backgroundColor: posting ? "rgba(28,102,255,0.55)" : "#1C66FF",
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
            opacity: loadingPets || pets.length === 0 ? 0.6 : 1,
          }}
        >
          {posting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
              Publicar anúncio
            </Text>
          )}
        </Pressable>

        <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.65)", textAlign: "center" }}>
          Você só seleciona o pet e escreve a descrição. O resto vem do seu cadastro.
        </Text>
      </ScrollView>
    </LinearGradient>
  );
}
