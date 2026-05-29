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
import { getFeedPetfinder } from "@/src/api/anuncioService";
import { useSideMenu } from "@/src/context/SideMenuContext";

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
  dataDesaparecimento?: string;

  nomeUsuario?: string;
  telefoneUsuario?: string;
};

type OrderFiltro = "recent" | "old";

function formatarData(data: Date): string {
  const dia = data.getDate().toString().padStart(2, '0');
  const mes = (data.getMonth() + 1).toString().padStart(2, '0');
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}

function clampText(text?: string, max = 120) {
  const t = String(text ?? "").trim();
  if (!t) return "";
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "...";
}

export default function Petfinder() {
  const { token } = useContext(AuthContext);
  const { openMenu } = useSideMenu();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [anuncios, setAnuncios] = useState<PetfinderFeedDTO[]>([]);
  const [search, setSearch] = useState("");

  type SexoFiltro = "M" | "F" | null;

  const [racasSelecionadas, setRacasSelecionadas] = useState<string[]>([]);
  const [sexoSelecionado, setSexoSelecionado] = useState<SexoFiltro>(null);

  function normalizeSexo(value?: string): "M" | "F" | null {
    const v = String(value ?? "").trim().toLowerCase();
    if (!v) return null;
    if (v === "m" || v === "macho") return "M";
    if (v === "f" || v === "femea" || v === "fêmea") return "F";
    return null;
  }

  const racasDisponiveis = useMemo(() => {
    const set = new Set<string>();
    anuncios.forEach((a) => {
      const r = String(a.racaPet ?? "").trim();
      if (r) set.add(r);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [anuncios]);


  const [descOverflow, setDescOverflow] = useState<Record<number, boolean>>({});

  // filtros
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [order, setOrder] = useState<OrderFiltro>("recent");

  const filtersCount = useMemo(() => {
    let c = 0;
    if (order !== "recent") c++;
    if (sexoSelecionado !== null) c++;
    if (racasSelecionadas.length > 0) c++;
    return c;
  }, [order, sexoSelecionado, racasSelecionadas]);


  async function load() {
    setError(null);

    // ✅ usando service (recomendado)
    const res: any = await getFeedPetfinder(token || undefined);

    // // 🟡 fallback (se não tiver service ainda)
    // const res: any = await api("Anuncio/feed/petfinder", "GET", undefined, token || undefined);

    if (!res?.ok) {
      setError(res?.data?.message || "Erro ao buscar feed do PetFinder");
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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = anuncios;

    // search (nome, raça, ultimoLocalVisto, descrição)
    if (q) {
      list = list.filter((a) => {
        return (
          String(a.nomePet ?? "").toLowerCase().includes(q) ||
          String(a.racaPet ?? "").toLowerCase().includes(q) ||
          String(a.ultimoLocalVisto ?? "").toLowerCase().includes(q) ||
          String(a.descricao ?? "").toLowerCase().includes(q)
        );
      });
    }

    // sexo
    if (sexoSelecionado !== null) {
      list = list.filter((a) => normalizeSexo(a.sexoPet) === sexoSelecionado);
    }

    // raças
    if (racasSelecionadas.length > 0) {
      list = list.filter((a) => racasSelecionadas.includes(String(a.racaPet ?? "").trim()));
    }


    // ordenação por dataCriacao
    list = [...list].sort((a, b) => {
      const da = new Date(a.dataCriacao).getTime();
      const db = new Date(b.dataCriacao).getTime();
      if (Number.isNaN(da) || Number.isNaN(db)) return 0;
      return order === "recent" ? db - da : da - db;
    });

    return list;
  }, [anuncios, search, order, sexoSelecionado, racasSelecionadas]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (order !== "recent") {
      chips.push({
        key: "order",
        label: `Ordem: ${order === "recent" ? "mais recente" : "mais antigo"}`,
        onRemove: () => setOrder("recent"),
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
  }, [order, sexoSelecionado, racasSelecionadas]);




  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Carregando PetFinder...</Text>
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
      {/* Header (igual Petinder) */}
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
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
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
            width: 40,
            height: 40,
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
          PetFinder
        </Text>
      </View>

      {/* Search + filtros */}
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
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
          <Ionicons name="search" size={18} color="#0E2B5A" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Pesquisar"
            placeholderTextColor="#8E8E93"
            style={{ flex: 1, color: "#111", fontWeight: "700" }}
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

        {/* Chips */}
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

      {/* Lista */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.anuncioId)}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 20,
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
        renderItem={({ item }) => {
          const local = String(item.ultimoLocalVisto ?? "").trim();
          const desc = clampText(item.descricao, 140);

          return (
            <Pressable
              onPress={() => router.push(`/anuncios/${item.anuncioId}`)}
              style={{
                backgroundColor: "#fff",
                borderRadius: 22,
                padding: 14,
                marginBottom: 14,
                shadowOpacity: 0.12,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
                elevation: 4,
              }}
            >
              {/* topo: foto + infos (igual figma) */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                {/* foto */}
                <View
                  style={{
                    width: 180,
                    height: 180,
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

                {/* infos */}
                <View style={{ flex: 1, justifyContent: "space-between" }}>
                  {/* NOME CENTRALIZADO (igual PeTinder) */}
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "900",
                      color: "#111",
                      textAlign: "center",
                    }}
                  >
                    {item.nomePet || "Pet"}
                  </Text>

                  <View style={{ marginTop: 10, gap: 6 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <MaterialCommunityIcons
                        name={
                          Number(item.tipoPet) === 1 ||
                            String(item.tipoPet ?? "").toUpperCase() === "GATO"
                            ? "cat"
                            : "dog"
                        }
                        size={16}
                        color="#0E2B5A"
                      />
                      <Text style={{ color: "#222", fontWeight: "800" }}>
                        {item.racaPet || "R.N.D"}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <Ionicons name="location" size={16} color="#0E2B5A" />
                      <Text
                        numberOfLines={2}
                        ellipsizeMode="tail"
                        style={{
                          color: "#222",
                          fontWeight: "800",
                          flex: 1,          // ocupa o espaço disponível sem estourar
                          paddingRight: 12, // ✅ “margem” no fim do card
                        }}
                      >
                        {local || "Local não informado"}
                      </Text>

                    </View>
                  </View>

                  {/* Infos extras do pet (idade + sexo) */}
                  <View style={{ gap: 6 }}>
                    {!!item.idadePet && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Ionicons name="calendar" size={16} color="#0E2B5A" />
                        <Text style={{ color: "#222", fontWeight: "800" }}>
                          {item.idadePet}
                        </Text>
                      </View>
                    )}

                    {!!item.sexoPet && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <MaterialCommunityIcons name="gender-male-female" size={16} color="#0E2B5A" />
                        <Text style={{ color: "#222", fontWeight: "800" }}>
                          {String(item.sexoPet).toLowerCase().startsWith("m") ? "Macho" : "Fêmea"}
                        </Text>
                      </View>
                    )}
                  </View>


                  {/* botão "Saiba mais" */}
                  <Pressable
                    onPress={() => router.push(`/anuncios/${item.anuncioId}`)}
                    style={{
                      alignSelf: "center",
                      backgroundColor: "#0B3B91",
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 140,
                      marginTop: 10,
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>
                      Saiba mais
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* "Informações" + descrição */}
              <View style={{ marginTop: 12 }}>
                <Text style={{ fontWeight: "900", color: "#111", textAlign: "center" }}>
                  Informações
                </Text>

                <Text
                  onTextLayout={(e) => {
                    const lines = e.nativeEvent.lines?.length ?? 0;
                    if (lines > 3) {
                      setDescOverflow((prev) => {
                        if (prev[item.anuncioId]) return prev; // evita setState infinito
                        return { ...prev, [item.anuncioId]: true };
                      });
                    }
                  }}
                  numberOfLines={3}
                  ellipsizeMode="tail"
                  style={{
                    marginTop: 8,
                    color: "#333",
                    fontWeight: "700",
                    lineHeight: 20,
                    textAlign: "left",
                  }}
                >
                  {desc || "Sem descrição."}
                </Text>

                {!!descOverflow[item.anuncioId] && (
                  <Pressable onPress={() => router.push(`/anuncios/${item.anuncioId}`)}>
                    <Text
                      style={{
                        marginTop: 6,
                        color: "#0B3B91",
                        fontWeight: "900",
                        textAlign: "right",
                      }}
                    >
                      Ler mais
                    </Text>
                  </Pressable>
                )}

                {!!item.dataCriacao && (
                  <Text style={{ marginTop: 8, color: "#666", fontWeight: "700", fontSize: 12 }}>
                    Publicado em: {formatarData(new Date(item.dataCriacao))}
                  </Text>
                )}
              </View>

            </Pressable>
          );
        }}
      />

      {/* Modal de filtros */}
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
              {/* Ordenação */}
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

              <Text style={{ fontWeight: "900", marginBottom: 8 }}>Ordenar por</Text>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => setOrder("recent")}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: order === "recent" ? "#0B3B91" : "#ddd",
                    backgroundColor: order === "recent" ? "rgba(11,59,145,0.10)" : "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontWeight: "900" }}>Mais recente</Text>
                </Pressable>

                <Pressable
                  onPress={() => setOrder("old")}
                  style={{
                    flex: 1,
                    paddingVertical: 10,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: order === "old" ? "#0B3B91" : "#ddd",
                    backgroundColor: order === "old" ? "rgba(11,59,145,0.10)" : "#fff",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontWeight: "900" }}>Mais antigo</Text>
                </Pressable>
              </View>
            </ScrollView>

            {/* Ações */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable
                onPress={() => {
                  setOrder("recent");
                  setSexoSelecionado(null);
                  setRacasSelecionadas([]);
                }}
                style={{
                  flex: 1,
                  borderWidth: 1,
                  borderColor: "#ddd",
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
                  backgroundColor: "#0B3B91",
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

      {/* Floating + (já deixa pronto pro próximo passo) */}
      <Pressable
        onPress={() => router.push({ pathname: "/anuncios/novo", params: { tipo: "petfinder" } })}
        style={{
          position: "absolute",
          right: 18,
          bottom: 18,
          width: 62,
          height: 62,
          borderRadius: 999,
          backgroundColor: "#1C66FF",
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
