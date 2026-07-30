import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  TextInput,
  Modal,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { AuthContext } from "@/src/context/AuthContext";
import { getFeedPetinder } from "@/src/api/anuncioService";
import { useSideMenu } from "@/src/context/SideMenuContext";
import { TutorPalette } from "@/constants/theme";

type AnuncioPetinder = {
  anuncioId: number;
  descricao: string;
  dataCriacao: string;
  fotoPet?: string;
  nomePet: string;
  idadePet: string;
  sexoPet: string;
  racaPet: string;
  cidade: string;
  uf: string;
  bairro: string;
  tipoPet: string;
};

type SexoFiltro = "M" | "F" | null;

function idadeTextoParaMeses(texto?: string): number | null {
  if (!texto) return null;

  const t = texto.toLowerCase();

  // pega "2 anos", "1 ano", etc
  const anosMatch = t.match(/(\d+)\s*ano/);
  // pega "3 meses", "1 mes", etc
  const mesesMatch = t.match(/(\d+)\s*mes/);

  const anos = anosMatch ? Number(anosMatch[1]) : 0;
  const meses = mesesMatch ? Number(mesesMatch[1]) : 0;

  const total = anos * 12 + meses;

  // fallback: se veio só "2" (sem unidade), assume anos
  if (total === 0) {
    const n = t.match(/(\d+)/);
    return n ? Number(n[1]) * 12 : null;
  }

  return total;
}

export default function Petinder() {
  const { token } = useContext(AuthContext);
  const { openMenu } = useSideMenu();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [anuncios, setAnuncios] = useState<AnuncioPetinder[]>([]);
  const [search, setSearch] = useState("");

  // Modal filtros
  const [filtersOpen, setFiltersOpen] = useState(false);

  // idade (mín e máx)
  const [idadeMin, setIdadeMin] = useState<string>("");
  const [idadeMax, setIdadeMax] = useState<string>("");

  // raças selecionadas (multi)
  const [racasSelecionadas, setRacasSelecionadas] = useState<string[]>([]);

  // sexo selecionado
  const [sexoSelecionado, setSexoSelecionado] = useState<SexoFiltro>(null);

  function normalizeSexo(value?: string): "M" | "F" | null {
    const v = String(value ?? "").trim().toLowerCase();
    if (!v) return null;
    if (v === "m" || v === "macho") return "M";
    if (v === "f" || v === "femea" || v === "fêmea") return "F";
    return null;
  }

  // contador de filtros ativos
  const filtersCount = useMemo(() => {
    let count = 0;
    if (idadeMin.trim() !== "" || idadeMax.trim() !== "") count++;
    if (racasSelecionadas.length > 0) count++;
    if (sexoSelecionado !== null) count++;
    return count;
  }, [idadeMin, idadeMax, racasSelecionadas, sexoSelecionado]);

  // raças existentes no feed
  const racasDisponiveis = useMemo(() => {
    const set = new Set<string>();
    anuncios.forEach((a) => {
      if (a.racaPet && a.racaPet.trim()) set.add(a.racaPet.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [anuncios]);

  async function load() {
    setError(null);
    const res: any = await getFeedPetinder(token || undefined);

    if (!res?.ok) {
      setError(res?.data?.message || "Erro ao buscar feed do PeTinder");
      setAnuncios([]);
      return;
    }

    const list = Array.isArray(res.data?.data) ? res.data.data : [];
    setAnuncios(list);
  }

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        setLoading(true);
        await load();
        if (isActive) setLoading(false);
      })();
      return () => {
        isActive = false;
      };
    }, [token])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  // aplica pesquisa + filtros
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const minAnos = idadeMin.trim() === "" ? null : Number(idadeMin);
    const maxAnos = idadeMax.trim() === "" ? null : Number(idadeMax);

    const minOk = minAnos === null || !Number.isNaN(minAnos);
    const maxOk = maxAnos === null || !Number.isNaN(maxAnos);

    // converte anos digitados no filtro para meses
    const minMeses = minOk && minAnos !== null ? minAnos * 12 : null;
    const maxMeses = maxOk && maxAnos !== null ? maxAnos * 12 : null;


    return anuncios.filter((a) => {
      // pesquisa
      if (q) {
        const matchesSearch =
          a.nomePet?.toLowerCase().includes(q) ||
          a.racaPet?.toLowerCase().includes(q) ||
          a.cidade?.toLowerCase().includes(q) ||
          a.bairro?.toLowerCase().includes(q) ||
          String(a.tipoPet ?? "").toLowerCase().includes(q);


        if (!matchesSearch) return false;
      }

      // idade
      // idade (comparando em meses)
      const idadeEmMeses = idadeTextoParaMeses(a.idadePet);

      if (minMeses !== null && idadeEmMeses !== null && idadeEmMeses < minMeses) return false;
      if (maxMeses !== null && idadeEmMeses !== null && idadeEmMeses > maxMeses) return false;


      // raças
      if (racasSelecionadas.length > 0 && !racasSelecionadas.includes(a.racaPet)) {
        return false;
      }

      // sexo
      if (sexoSelecionado !== null) {
        const sx = normalizeSexo(a.sexoPet);
        if (sx !== sexoSelecionado) return false;
      }

      return true;
    });
  }, [search, anuncios, idadeMin, idadeMax, racasSelecionadas, sexoSelecionado]);

  // chips (filtros ativos) com remoção individual
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    const min = idadeMin.trim();
    const max = idadeMax.trim();
    if (min || max) {
      const label = `Idade: ${min || "0"}–${max || "∞"}`;
      chips.push({
        key: "idade",
        label,
        onRemove: () => {
          setIdadeMin("");
          setIdadeMax("");
        },
      });
    }

    if (sexoSelecionado) {
      chips.push({
        key: "sexo",
        label: `Sexo: ${sexoSelecionado === "M" ? "Macho" : "Fêmea"}`,
        onRemove: () => setSexoSelecionado(null),
      });
    }

    if (racasSelecionadas.length > 0) {
      racasSelecionadas.forEach((raca) => {
        chips.push({
          key: `raca:${raca}`,
          label: raca,
          onRemove: () =>
            setRacasSelecionadas((prev) => prev.filter((x) => x !== raca)),
        });
      });
    }

    return chips;
  }, [idadeMin, idadeMax, sexoSelecionado, racasSelecionadas]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Carregando PeTinder...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={[TutorPalette.background, TutorPalette.backgroundSecondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
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
          onPress={openMenu}
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(255,255,255,0.10)",
          }}
        >
          <Feather name="menu" size={22} color="#fff" />
        </Pressable>

        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>
          PetLink
        </Text>

        <Pressable
          onPress={() => router.push("/perfil")}
          style={{
            width: 42,
            height: 42,
            borderRadius: 999,
            backgroundColor: "rgba(255,255,255,0.12)",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="person" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Title */}
      <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
        <View style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: TutorPalette.border }}>
          <Text style={{ color: TutorPalette.text, fontSize: 18, fontWeight: "900" }}>PeTinder</Text>
          <Text style={{ color: TutorPalette.muted, fontSize: 13, marginTop: 4 }}>Descubra conexões entre pets com um feed mais sofisticado.</Text>
        </View>
      </View>

      {/* Search + filters */}
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
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
          <Ionicons name="search" size={18} color={TutorPalette.primary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Pesquisar"
            placeholderTextColor="#8E8E93"
            style={{ flex: 1, color: TutorPalette.background, fontWeight: "700" }}
          />
        </View>

        <Pressable
          onPress={() => setFiltersOpen(true)}
          style={{
            marginTop: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Ionicons name="funnel" size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            Filtros({filtersCount})
          </Text>
        </Pressable>

        {/* Chips filtros ativos */}
        {activeChips.length > 0 && (
          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            {activeChips.map((chip) => (
              <Pressable
                key={chip.key}
                onPress={chip.onRemove}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingVertical: 6,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.16)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.18)",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "800" }}>
                  {chip.label}
                </Text>
                <Ionicons name="close" size={16} color="#fff" />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Error */}
      {!!error && (
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <Text style={{ color: "#ffb4b4", fontWeight: "800" }}>{error}</Text>
        </View>
      )}

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.anuncioId)}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 120,
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={() => (
          <View style={{ paddingTop: 20 }}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>
              Nenhum anúncio no feed
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
              Ajuste os filtros ou crie um anúncio clicando no botão +.
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/anuncios/${item.anuncioId}`)}
            style={{
              backgroundColor: "rgba(15,29,58,0.92)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.10)",
              borderRadius: 22,
              paddingVertical: 16,
              paddingHorizontal: 16,
              marginBottom: 14,
              flexDirection: "row",
              alignItems: "center",
              shadowColor: TutorPalette.shadow,
              shadowOpacity: 0.16,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 8 },
              elevation: 4,
            }}
          >
            {/* Imagem */}
            <View
              style={{
                width: 150,
                height: 150,
                borderRadius: 18,
                overflow: "hidden",
                backgroundColor: "#EEE",
              }}
            >
              {!!item.fotoPet ? (
                <Image
                  source={{ uri: item.fotoPet }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="paw" size={26} color="#999" />
                </View>
              )}
            </View>

            {/* Conteúdo */}
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "900",
                  color: "#fff",
                  textAlign: "center",
                }}
              >
                {item.nomePet}
              </Text>

              <View style={{ marginTop: 10, gap: 8 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                >
                  <MaterialCommunityIcons
                    name={String(item.tipoPet).toUpperCase() === "GATO" ? "cat" : "dog"}
                    size={18}
                    color={TutorPalette.primary}
                  />
                  <Text style={{ color: "#e6ecff", fontWeight: "700" }}>
                    {item.racaPet || "Não informado"}
                  </Text>
                </View>

                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                >
                  <Ionicons name="calendar" size={18} color={TutorPalette.primary} />
                  <Text style={{ color: "#e6ecff", fontWeight: "700" }}>
                    {item.idadePet || "Idade não informada"}
                  </Text>
                </View>

                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                >
                  <Ionicons name="location" size={18} color={TutorPalette.primary} />
                  <Text
                    numberOfLines={3}
                    ellipsizeMode="tail"
                    style={{
                      color: "#e6ecff",
                      fontWeight: "800",
                      flex: 1,          // ocupa o espaço disponível sem estourar
                      paddingRight: 12, // ✅ “margem” no fim do card
                    }}
                  >
                    {item.cidade}
                    {item.bairro ? ` • ${item.bairro}` : ""}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() => router.push(`/anuncios/${item.anuncioId}`)}
                style={{
                  alignSelf: "center",
                  marginTop: 12,
                  backgroundColor: TutorPalette.primary,
                  paddingVertical: 10,
                  paddingHorizontal: 28,
                  borderRadius: 999,
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 160,
                }}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "900",
                    fontSize: 14,
                    textAlign: "center",
                    includeFontPadding: false,
                  }}
                >
                  Ver anúncio
                </Text>
              </Pressable>
            </View>
          </Pressable>
        )}
      />

      {/* Modal filtros */}
      <Modal
        visible={filtersOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFiltersOpen(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 18,
              padding: 16,
              maxHeight: "80%",
            }}
          >
            {/* Cabeçalho */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "900" }}>Filtros</Text>
              <Pressable onPress={() => setFiltersOpen(false)}>
                <Ionicons name="close" size={24} color="#111" />
              </Pressable>
            </View>

            <ScrollView style={{ marginTop: 14 }} contentContainerStyle={{ paddingBottom: 10 }}>
              {/* Idade */}
              <Text style={{ fontWeight: "900", marginBottom: 8 }}>Idade (anos)</Text>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#666", fontWeight: "700", marginBottom: 6 }}>Mín</Text>
                  <TextInput
                    value={idadeMin}
                    onChangeText={setIdadeMin}
                    keyboardType="numeric"
                    placeholder="Ex: 1"
                    style={{
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    }}
                  />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#666", fontWeight: "700", marginBottom: 6 }}>Máx</Text>
                  <TextInput
                    value={idadeMax}
                    onChangeText={setIdadeMax}
                    keyboardType="numeric"
                    placeholder="Ex: 8"
                    style={{
                      borderWidth: 1,
                      borderColor: "#ddd",
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 10,
                    }}
                  />
                </View>
              </View>

              {/* Sexo */}
              <Text style={{ fontWeight: "900", marginTop: 18, marginBottom: 8 }}>Sexo</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => setSexoSelecionado(null)}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: sexoSelecionado === null ? "#0B3B91" : "#ddd",
                    backgroundColor: sexoSelecionado === null ? "rgba(11,59,145,0.10)" : "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontWeight: "900" }}>Todos</Text>
                </Pressable>

                <Pressable
                  onPress={() => setSexoSelecionado("M")}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: sexoSelecionado === "M" ? "#0B3B91" : "#ddd",
                    backgroundColor: sexoSelecionado === "M" ? "rgba(11,59,145,0.10)" : "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontWeight: "900" }}>Macho</Text>
                </Pressable>

                <Pressable
                  onPress={() => setSexoSelecionado("F")}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: sexoSelecionado === "F" ? "#0B3B91" : "#ddd",
                    backgroundColor: sexoSelecionado === "F" ? "rgba(11,59,145,0.10)" : "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontWeight: "900" }}>Fêmea</Text>
                </Pressable>
              </View>

              {/* Raças */}
              <Text style={{ fontWeight: "900", marginTop: 18, marginBottom: 8 }}>Raças</Text>

              {racasDisponiveis.length === 0 ? (
                <Text style={{ color: "#666" }}>Nenhuma raça encontrada no feed.</Text>
              ) : (
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                  {racasDisponiveis.map((raca) => {
                    const selected = racasSelecionadas.includes(raca);
                    return (
                      <Pressable
                        key={raca}
                        onPress={() => {
                          setRacasSelecionadas((prev) =>
                            selected ? prev.filter((x) => x !== raca) : [...prev, raca]
                          );
                        }}
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: selected ? "#0B3B91" : "#ddd",
                          backgroundColor: selected ? "rgba(11,59,145,0.10)" : "#fff",
                        }}
                      >
                        <Text style={{ fontWeight: "800", color: "#111" }}>{raca}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            {/* Ações */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable
                onPress={() => {
                  setIdadeMin("");
                  setIdadeMax("");
                  setRacasSelecionadas([]);
                  setSexoSelecionado(null);
                }}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#d7deea",
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontWeight: "900" }}>Limpar</Text>
              </Pressable>

              <Pressable
                onPress={() => setFiltersOpen(false)}
                style={{
                  flex: 1,
                  backgroundColor: TutorPalette.primary,
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>Aplicar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating + */}
      <Pressable
        onPress={() => router.push({ pathname: "/anuncios/novo", params: { tipo: "petinder" } })}
        style={{
          position: "absolute",
          right: 18,
          bottom: 18,
          width: 62,
          height: 62,
          borderRadius: 999,
          backgroundColor: TutorPalette.primary,
          alignItems: "center",
          justifyContent: "center",
          shadowOpacity: 0.25,
          shadowRadius: 10,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </Pressable>
    </LinearGradient>
  );
}
