// app/anuncios/editar.tsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

import { AuthContext } from "@/src/context/AuthContext";
import { api } from "@/src/api/api";
import { getFeedPetinder, getFeedPetfinder, getFeedPaypet } from "@/src/api/anuncioService";
import { TutorPalette } from "@/constants/theme";

type BaseAnuncioDTO = {
  id: number;
  descricao: string;
  tipoAnuncio: number;
  usuarioId: number;
};

type PetinderFeedDTO = {
  anuncioId: number;
  descricao: string;
  dataCriacao: string;
  fotoPet?: string;
  nomePet: string;
  idadePet?: string;
  sexoPet?: string;
  racaPet?: string;
  tipoPet?: string | number;
  nomeUsuario?: string;
  telefoneUsuario?: string;
};

type PetfinderFeedDTO = {
  anuncioId: number;
  descricao: string;
  dataCriacao: string;

  fotoPet?: string;
  nomePet: string;
  racaPet: string;
  tipoPet: string | number;
  idadePet?: string;
  sexoPet?: string;

  ultimoLocalVisto: string;
  dataDesaparecimento?: string; // ISO do back
};

type PaypetFeedDTO = {
  anuncioId: number;
  descricao: string;
  dataCriacao: string;

  fotoPet?: string;
  nomePet: string;
  idadePet?: string;
  sexoPet?: string;
  racaPet?: string;
  tipoPet?: string | number;

  tipoPayPet?: number; // 1=DOACAO/ADOCAO, 2=VENDA
  valor?: number;
};

function formatDateBR(d: Date) {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function safeDateFromISO(iso?: string): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

// Se seu enum for diferente, ajuste aqui:
function tipoToKey(tipoAnuncio: number): "petinder" | "petfinder" | "paypet" {
  if (tipoAnuncio === 2) return "petfinder";
  if (tipoAnuncio === 3) return "paypet";
  return "petinder";
}

export default function EditarAnuncio() {
  const { token, user } = useContext(AuthContext);
  const params = useLocalSearchParams<{ id?: string }>();
  const id = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [base, setBase] = useState<BaseAnuncioDTO | null>(null);

  // comuns
  const [descricao, setDescricao] = useState("");

  // petfinder
  const [ultimoLocalVisto, setUltimoLocalVisto] = useState("");
  const [dataDesaparecimento, setDataDesaparecimento] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);

  // paypet
  const [tipoPayPet, setTipoPayPet] = useState<1 | 2>(2);
  const [valor, setValor] = useState<string>("");

  const tipoKey = useMemo(() => {
    if (!base) return "petinder";
    return tipoToKey(Number(base.tipoAnuncio));
  }, [base]);

  const isOwner = useMemo(() => {
    if (!base?.usuarioId || !user?.id) return false;
    return Number(base.usuarioId) === Number(user.id);
  }, [base?.usuarioId, user?.id]);

  async function load() {
    setError(null);

    if (!token) {
      setError("Faça login novamente.");
      return;
    }
    if (!Number.isFinite(id) || id <= 0) {
      setError("ID inválido.");
      return;
    }

    // 1) base
    const resBase: any = await api(`Anuncio/${id}`, "GET", undefined, token || undefined);
    if (!resBase?.ok) {
      setError(resBase?.data?.message || "Erro ao buscar anúncio.");
      return;
    }

    const b: BaseAnuncioDTO = resBase?.data?.data ?? resBase?.data;
    setBase(b);
    setDescricao(String(b?.descricao ?? ""));

    // 2) detalhes (pega do feed correspondente)
    const tk = tipoToKey(Number(b.tipoAnuncio));

    if (tk === "petfinder") {
      const res: any = await getFeedPetfinder(token || undefined);
      const list: PetfinderFeedDTO[] = Array.isArray(res?.data?.data) ? res.data.data : [];
      const item = list.find((x) => Number(x.anuncioId) === id);
      if (item) {
        setUltimoLocalVisto(String(item.ultimoLocalVisto ?? ""));
        setDataDesaparecimento(safeDateFromISO(item.dataDesaparecimento) ?? null);
      }
    }

    if (tk === "paypet") {
      const res: any = await getFeedPaypet(token || undefined);
      const list: PaypetFeedDTO[] = Array.isArray(res?.data?.data) ? res.data.data : [];
      const item = list.find((x) => Number(x.anuncioId) === id);
      if (item) {
        const t = Number(item.tipoPayPet) === 1 ? 1 : 2;
        setTipoPayPet(t);
        setValor(
          t === 2 && item.valor != null && !Number.isNaN(Number(item.valor))
            ? String(item.valor)
            : ""
        );
      }
    }

    // petinder não tem extras
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [id]);

  useEffect(() => {
    // se carregou e não é dono, avisa
    if (!loading && base && !isOwner) {
      Alert.alert("Sem permissão", "Você só pode editar anúncios criados por você.");
      router.back();
    }
  }, [loading, base, isOwner]);

  function validate() {
    if (!descricao.trim()) return "A descrição é obrigatória.";

    if (tipoKey === "petfinder") {
      if (!ultimoLocalVisto.trim()) return "Informe o último local visto.";
      if (!dataDesaparecimento) return "Selecione a data de desaparecimento.";
      // não deixa futuro
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const chosen = new Date(dataDesaparecimento);
      chosen.setHours(0, 0, 0, 0);
      if (chosen.getTime() > today.getTime()) return "A data não pode ser no futuro.";
    }

    if (tipoKey === "paypet") {
      if (tipoPayPet === 2) {
        const v = Number(valor);
        if (!valor.trim() || Number.isNaN(v) || v <= 0) return "Para venda, informe um preço maior que 0.";
      }
    }

    return null;
  }

  async function salvar() {
    const msg = validate();
    if (msg) {
      Alert.alert("Atenção", msg);
      return;
    }
    if (!token) return;

    setSaving(true);

    try {
      // 1) sempre atualiza descrição na base
      const bodyBase = {
        id,
        descricao: descricao.trim(),
        tipoAnuncio: base?.tipoAnuncio ?? 1,
        usuarioId: base?.usuarioId ?? user?.id ?? 0,
      };

      const resBase: any = await api(`Anuncio/${id}`, "PUT", bodyBase, token || undefined);
      if (!resBase?.ok) {
        Alert.alert("Erro", resBase?.data?.message || "Não foi possível salvar a descrição.");
        return;
      }

      // 2) extras por tipo
      if (tipoKey === "petfinder") {
        const d = dataDesaparecimento!;
        const utcIso = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();

        const resPF: any = await api(
          `Anuncio/${id}/petfinder`,
          "PUT",
          {
            ultimoLocalVisto: ultimoLocalVisto.trim(),
            dataDesaparecimento: utcIso,
          },
          token || undefined
        );

        if (!resPF?.ok) {
          Alert.alert("Erro", resPF?.data?.message || "Não foi possível salvar os dados do PetFinder.");
          return;
        }
      }

      if (tipoKey === "paypet") {
        const payload: any = {
          tipoPayPet: tipoPayPet, // 1/2
          valor: tipoPayPet === 1 ? 0 : Number(valor),
        };

        const resPP: any = await api(`Anuncio/${id}/paypet`, "PUT", payload, token || undefined);
        if (!resPP?.ok) {
          Alert.alert("Erro", resPP?.data?.message || "Não foi possível salvar os dados do PayPet.");
          return;
        }
      }

      Alert.alert("Sucesso", "Anúncio atualizado!");
      router.back();
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Carregando...</Text>
      </View>
    );
  }

  if (!!error) {
    return (
      <LinearGradient
        colors={[TutorPalette.background, TutorPalette.backgroundSecondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20 }}
      >
        <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, justifyContent: "center" }}>
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>

        <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18, marginTop: 10 }}>
          Erro
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.85)", marginTop: 10, fontWeight: "700" }}>
          {error}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[TutorPalette.background, TutorPalette.backgroundSecondary]}
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
            width: 42,
            height: 42,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.10)",
          }}
        >
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>

        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>
          Editar anúncio • {tipoKey === "petinder" ? "PeTinder" : tipoKey === "petfinder" ? "PetFinder" : "PayPet"}
        </Text>

        <View style={{ width: 40, height: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {/* Descrição (sempre) */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: "rgba(255,255,255,0.95)", fontWeight: "900", marginBottom: 8 }}>
            Descrição
          </Text>

          <View style={{ backgroundColor: "rgba(245,247,255,0.96)", borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10 }}>
            <TextInput
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Escreva a descrição..."
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

        {/* PetFinder extras */}
        {tipoKey === "petfinder" && (
          <>
            <View style={{ marginTop: 12 }}>
              <Text style={{ color: "rgba(255,255,255,0.95)", fontWeight: "900", marginBottom: 8 }}>
                Último local visto
              </Text>

              <View
                style={{
                  backgroundColor: "rgba(245,247,255,0.96)",
                  borderRadius: 999,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name="location" size={18} color={TutorPalette.primary} />
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
                  backgroundColor: "rgba(245,247,255,0.96)",
                  borderRadius: 999,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <Ionicons name="calendar" size={18} color={TutorPalette.primary} />
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
                  display={Platform.OS === "ios" ? "spinner" : "calendar"}
                  maximumDate={new Date()} // ✅ não deixa futuro
                  onChange={(event, selected) => {
                    // android cancel
                    setShowPicker(false);
                    // @ts-ignore
                    if (event?.type === "dismissed") return;
                    if (selected) setDataDesaparecimento(selected);
                  }}
                />
              )}
            </View>
          </>
        )}

        {/* PayPet extras */}
        {tipoKey === "paypet" && (
          <>
            <View style={{ marginTop: 14 }}>
              <Text style={{ color: "rgba(255,255,255,0.95)", fontWeight: "900", marginBottom: 8 }}>
                Tipo
              </Text>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => setTipoPayPet(1)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: tipoPayPet === 1 ? TutorPalette.primary : "rgba(255,255,255,0.25)",
                    backgroundColor: tipoPayPet === 1 ? "rgba(47,124,246,0.20)" : "rgba(255,255,255,0.10)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "900" }}>Doação</Text>
                </Pressable>

                <Pressable
                  onPress={() => setTipoPayPet(2)}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: tipoPayPet === 2 ? TutorPalette.primary : "rgba(255,255,255,0.25)",
                    backgroundColor: tipoPayPet === 2 ? "rgba(47,124,246,0.20)" : "rgba(255,255,255,0.10)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontWeight: "900" }}>Venda</Text>
                </Pressable>
              </View>
            </View>

            {tipoPayPet === 2 && (
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: "rgba(255,255,255,0.95)", fontWeight: "900", marginBottom: 8 }}>
                  Preço
                </Text>

                <View
                  style={{
                    backgroundColor: "rgba(245,247,255,0.96)",
                    borderRadius: 999,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Ionicons name="cash" size={18} color={TutorPalette.primary} />
                  <TextInput
                    value={valor}
                    onChangeText={setValor}
                    keyboardType="numeric"
                    placeholder="Ex: 150"
                    placeholderTextColor="#8E8E93"
                    style={{ flex: 1, color: "#111", fontWeight: "800" }}
                  />
                </View>
              </View>
            )}
          </>
        )}

        {/* Salvar */}
        <Pressable
          disabled={saving}
          onPress={salvar}
          style={{
            marginTop: 18,
            backgroundColor: saving ? "rgba(47,124,246,0.55)" : TutorPalette.primary,
            borderRadius: 999,
            paddingVertical: 14,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
              Salvar alterações
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}
