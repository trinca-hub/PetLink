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
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

import { AuthContext } from "@/src/context/AuthContext";
import { getFeedPaypet } from "@/src/api/anuncioService"; // se não existir, troca pro fallback com api
import { useSideMenu } from "@/src/context/SideMenuContext";

type PaypetFeedDTO = {
  anuncioId: number;
  descricao: string;
  dataCriacao: string;

  fotoPet?: string;
  nomePet: string;
  idadePet?: string; // string (ex: "7 anos")
  sexoPet?: string;
  racaPet?: string;
  tipoPet?: string | number;

  tipoPayPet?: number; // 1=DOACAO/ADOCAO, 2=VENDA
  valor?: number;

  nomeUsuario?: string;
  telefoneUsuario?: string;

  cidade?: string;
  uf?: string;
  bairro?: string;
};

type TipoPetFiltro = "CACHORRO" | "GATO" | null;
type SexoFiltro = "M" | "F" | null;
type TipoPayPetFiltro = "VENDA" | "DOACAO" | null;

function normalizeTipoPet(value: any): "CACHORRO" | "GATO" | null {
  const v = String(value ?? "").trim().toUpperCase();
  if (!v) return null;
  if (v === "1" || v.includes("GATO")) return "GATO";
  if (v === "2" || v.includes("CACHORRO") || v.includes("CAO") || v.includes("CÃO")) return "CACHORRO";
  return null;
}

function normalizeSexo(value?: string): "M" | "F" | null {
  const v = String(value ?? "").trim().toLowerCase();
  if (!v) return null;
  if (v === "m" || v.startsWith("macho")) return "M";
  if (v === "f" || v.startsWith("femea") || v.startsWith("fêmea")) return "F";
  return null;
}

function parseIdadeNumber(idadePet?: string): number | null {
  const n = Number(String(idadePet ?? "").match(/\d+/)?.[0]);
  return Number.isFinite(n) ? n : null;
}

function isDoacao(tipoPayPet: any) {
  return Number(tipoPayPet) === 1;
}
function isVenda(tipoPayPet: any) {
  return Number(tipoPayPet) === 2;
}

function tipoPayPetLabel(v?: number) {
  if (v === 1) return "Doação";
  if (v === 2) return "Venda";
  return "Não informado";
}

function formatMoneyBR(valor?: number) {
  if (valor == null || Number.isNaN(valor)) return "";
  const s = Number(valor).toFixed(2).replace(".", ",");
  return `R$ ${s}`;
}

export default function PayPet() {
  const { token } = useContext(AuthContext);
  const { width } = useWindowDimensions();
  const { openMenu } = useSideMenu();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [anuncios, setAnuncios] = useState<PaypetFeedDTO[]>([]);
  const [search, setSearch] = useState("");

  const [filtersOpen, setFiltersOpen] = useState(false);

  // filtros
  const [tipoPetSelecionado, setTipoPetSelecionado] = useState<TipoPetFiltro>(null);
  const [sexoSelecionado, setSexoSelecionado] = useState<SexoFiltro>(null);
  const [tipoPayPetSelecionado, setTipoPayPetSelecionado] = useState<TipoPayPetFiltro>(null);

  const [idadeMin, setIdadeMin] = useState<string>("");
  const [idadeMax, setIdadeMax] = useState<string>("");

  const [valorMin, setValorMin] = useState<string>("");
  const [valorMax, setValorMax] = useState<string>("");

  // grid
  const GAP = 12;
  const CARD_W = useMemo(() => {
    const contentW = width - 16 * 2;
    return (contentW - GAP) / 2;
  }, [width]);

  async function load() {
    setError(null);

    const res: any = await getFeedPaypet(token || undefined);

    // fallback se necessário:
    // const res: any = await api("Anuncio/feed/paypet", "GET", undefined, token || undefined);

    if (!res?.ok) {
      setError(res?.data?.message || "Erro ao buscar feed do PayPet");
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

  const filtersCount = useMemo(() => {
    let c = 0;
    if (tipoPetSelecionado !== null) c++;
    if (sexoSelecionado !== null) c++;
    if (tipoPayPetSelecionado !== null) c++;
    if (idadeMin.trim() || idadeMax.trim()) c++;
    if (valorMin.trim() || valorMax.trim()) c++;
    return c;
  }, [tipoPetSelecionado, sexoSelecionado, tipoPayPetSelecionado, idadeMin, idadeMax, valorMin, valorMax]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];

    if (tipoPetSelecionado) {
      chips.push({
        key: "tipoPet",
        label: `Espécie: ${tipoPetSelecionado === "CACHORRO" ? "Cachorro" : "Gato"}`,
        onRemove: () => setTipoPetSelecionado(null),
      });
    }

    if (sexoSelecionado) {
      chips.push({
        key: "sexo",
        label: `Sexo: ${sexoSelecionado === "M" ? "Macho" : "Fêmea"}`,
        onRemove: () => setSexoSelecionado(null),
      });
    }

    if (tipoPayPetSelecionado) {
      chips.push({
        key: "tipoPayPet",
        label: `Tipo: ${tipoPayPetSelecionado === "VENDA" ? "Venda" : "Doação"}`,
        onRemove: () => setTipoPayPetSelecionado(null),
      });
    }

    if (idadeMin.trim() || idadeMax.trim()) {
      chips.push({
        key: "idade",
        label: `Idade: ${idadeMin || "0"}–${idadeMax || "∞"}`,
        onRemove: () => {
          setIdadeMin("");
          setIdadeMax("");
        },
      });
    }

    if (valorMin.trim() || valorMax.trim()) {
      chips.push({
        key: "valor",
        label: `Preço: ${valorMin || "0"}–${valorMax || "∞"}`,
        onRemove: () => {
          setValorMin("");
          setValorMax("");
        },
      });
    }

    return chips;
  }, [tipoPetSelecionado, sexoSelecionado, tipoPayPetSelecionado, idadeMin, idadeMax, valorMin, valorMax]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const minIdade = idadeMin.trim() === "" ? null : Number(idadeMin);
    const maxIdade = idadeMax.trim() === "" ? null : Number(idadeMax);

    const minValor = valorMin.trim() === "" ? null : Number(valorMin);
    const maxValor = valorMax.trim() === "" ? null : Number(valorMax);

    const minIdadeOk = minIdade === null || !Number.isNaN(minIdade);
    const maxIdadeOk = maxIdade === null || !Number.isNaN(maxIdade);

    const minValorOk = minValor === null || !Number.isNaN(minValor);
    const maxValorOk = maxValor === null || !Number.isNaN(maxValor);

    return anuncios.filter((a) => {
      // search
      if (q) {
        const matches =
          String(a.nomePet ?? "").toLowerCase().includes(q) ||
          String(a.racaPet ?? "").toLowerCase().includes(q) ||
          String(a.descricao ?? "").toLowerCase().includes(q) ||
          String(a.cidade ?? "").toLowerCase().includes(q) ||
          String(a.bairro ?? "").toLowerCase().includes(q);

        if (!matches) return false;
      }

      // espécie
      if (tipoPetSelecionado !== null) {
        if (normalizeTipoPet(a.tipoPet) !== tipoPetSelecionado) return false;
      }

      // sexo
      if (sexoSelecionado !== null) {
        if (normalizeSexo(a.sexoPet) !== sexoSelecionado) return false;
      }

      // venda/doação
      if (tipoPayPetSelecionado !== null) {
        if (tipoPayPetSelecionado === "DOACAO" && !isDoacao(a.tipoPayPet)) return false;
        if (tipoPayPetSelecionado === "VENDA" && !isVenda(a.tipoPayPet)) return false;
      }

      // idade
      if (minIdadeOk && minIdade !== null) {
        const idadeN = parseIdadeNumber(a.idadePet);
        if (idadeN === null || idadeN < minIdade) return false;
      }
      if (maxIdadeOk && maxIdade !== null) {
        const idadeN = parseIdadeNumber(a.idadePet);
        if (idadeN === null || idadeN > maxIdade) return false;
      }

      // regra do preço: max=0 => só doação
      if (maxValorOk && maxValor === 0) {
        if (!isDoacao(a.tipoPayPet)) return false;
        return true;
      }

      // se colocou min/max, filtra só vendas (doação não tem valor)
      if ((minValorOk && minValor !== null) || (maxValorOk && maxValor !== null)) {
        if (!isVenda(a.tipoPayPet)) return false;

        const v = Number(a.valor);
        if (Number.isNaN(v)) return false;

        if (minValorOk && minValor !== null && v < minValor) return false;
        if (maxValorOk && maxValor !== null && v > maxValor) return false;
      }

      return true;
    });
  }, [anuncios, search, tipoPetSelecionado, sexoSelecionado, tipoPayPetSelecionado, idadeMin, idadeMax, valorMin, valorMax]);

  function chipStyle() {
    return {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      gap: 6,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: "rgba(255,255,255,0.16)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.18)",
    };
  }

  function filtroPill(selected: boolean) {
    return {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: selected ? "#0B3B91" : "#ddd",
      backgroundColor: selected ? "rgba(11,59,145,0.10)" : "#fff",
      alignItems: "center" as const,
      justifyContent: "center" as const,
    };
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Carregando PayPet...</Text>
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
          style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}
        >
          <Feather name="menu" size={22} color="#fff" />
        </Pressable>

        <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>PetLink</Text>

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
          PayPet
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
          style={{ marginTop: 10, flexDirection: "row", alignItems: "center", gap: 8 }}
        >
          <Ionicons name="funnel" size={18} color="#fff" />
          <Text style={{ color: "#fff", fontWeight: "800" }}>Filtros({filtersCount})</Text>
        </Pressable>

        {activeChips.length > 0 && (
          <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {activeChips.map((chip) => (
              <Pressable key={chip.key} onPress={chip.onRemove} style={chipStyle()}>
                <Text style={{ color: "#fff", fontWeight: "800" }}>{chip.label}</Text>
                <Ionicons name="close" size={16} color="#fff" />
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {!!error && (
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <Text style={{ color: "#ffb4b4", fontWeight: "800" }}>{error}</Text>
        </View>
      )}

      {/* GRID */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.anuncioId)}
        numColumns={2}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 110,
        }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={() => (
          <View style={{ paddingTop: 20 }}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>Nenhum anúncio no feed</Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
              Tente mudar a pesquisa ou crie um anúncio no +.
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const local =
            item.cidade
              ? `${item.cidade}${item.uf ? ` - ${item.uf}` : ""}${item.bairro ? ` • ${item.bairro}` : ""}`
              : item.bairro || "Local não informado";

          const petIcon =
            Number(item.tipoPet) === 1 || String(item.tipoPet ?? "").toUpperCase() === "GATO"
              ? "cat"
              : "dog";

          return (
            <Pressable
              onPress={() => router.push(`/anuncios/${item.anuncioId}`)}
              style={{
                width: CARD_W,
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: 10,
                marginBottom: GAP,
                shadowOpacity: 0.1,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
                elevation: 3,
              }}
            >
              {/* Foto */}
              <View
                style={{
                  width: "100%",
                  height: CARD_W,
                  borderRadius: 14,
                  overflow: "hidden",
                  backgroundColor: "#EEE",
                }}
              >
                {!!item.fotoPet ? (
                  <Image source={{ uri: item.fotoPet }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                ) : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="paw" size={28} color="#999" />
                  </View>
                )}
              </View>

              {/* Nome */}
              <Text
                numberOfLines={1}
                style={{
                  marginTop: 10,
                  fontWeight: "900",
                  fontSize: 16,
                  color: "#111",
                  textAlign: "center",
                }}
              >
                {item.nomePet || "Pet"}
              </Text>

              {/* Infos */}
              <View style={{ marginTop: 8, gap: 6 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <MaterialCommunityIcons name={petIcon} size={16} color="#0E2B5A" />
                  <Text numberOfLines={1} style={{ color: "#222", fontWeight: "800", flex: 1 }}>
                    {item.racaPet || "Não informado"}
                  </Text>
                </View>

                {!!item.idadePet && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="calendar" size={16} color="#0E2B5A" />
                    <Text numberOfLines={1} style={{ color: "#222", fontWeight: "800", flex: 1 }}>
                      {item.idadePet}
                    </Text>
                  </View>
                )}

                {!!item.sexoPet && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Ionicons name="male-female" size={16} color="#0E2B5A" />
                    <Text numberOfLines={1} style={{ color: "#222", fontWeight: "800", flex: 1 }}>
                      {item.sexoPet}
                    </Text>
                  </View>
                )}

                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <Ionicons name="location" size={16} color="#0E2B5A" />
                  <Text numberOfLines={2} ellipsizeMode="tail" style={{ color: "#222", fontWeight: "800", flex: 1 }}>
                    {local}
                  </Text>
                </View>

                {/* Tipo + valor */}
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <View
                    style={{
                      paddingVertical: 6,
                      paddingHorizontal: 10,
                      borderRadius: 999,
                      backgroundColor: item.tipoPayPet === 2 ? "rgba(11,59,145,0.12)" : "rgba(0,0,0,0.06)",
                      borderWidth: 1,
                      borderColor: item.tipoPayPet === 2 ? "rgba(11,59,145,0.28)" : "rgba(0,0,0,0.12)",
                    }}
                  >
                    <Text style={{ fontWeight: "900", color: item.tipoPayPet === 2 ? "#0B3B91" : "#333" }}>
                      {tipoPayPetLabel(item.tipoPayPet)}
                    </Text>
                  </View>

                  {item.tipoPayPet === 2 && item.valor != null && Number(item.valor) > 0 ? (
                    <View
                      style={{
                        paddingVertical: 6,
                        paddingHorizontal: 12,
                        borderRadius: 999,
                        backgroundColor: "rgba(28,102,255,0.14)",
                        borderWidth: 1,
                        borderColor: "rgba(28,102,255,0.35)",
                      }}
                    >
                      <Text style={{ fontWeight: "900", color: "#0B3B91", fontSize: 16 }}>
                        {formatMoneyBR(item.valor)}
                      </Text>
                    </View>
                  ) : (
                    <View style={{ width: 1 }} />
                  )}
                </View>
              </View>

              {/* Botão */}
              <Pressable
                onPress={() => router.push(`/anuncios/${item.anuncioId}`)}
                style={{
                  marginTop: 10,
                  backgroundColor: "#0B3B91",
                  borderRadius: 999,
                  paddingVertical: 10,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>Contato</Text>
              </Pressable>
            </Pressable>
          );
        }}
      />

      {/* MODAL FILTROS */}
      <Modal visible={filtersOpen} transparent animationType="fade" onRequestClose={() => setFiltersOpen(false)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 16 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 18, padding: 16, maxHeight: "80%" }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 18, fontWeight: "900" }}>Filtros</Text>
              <Pressable onPress={() => setFiltersOpen(false)}>
                <Ionicons name="close" size={24} color="#111" />
              </Pressable>
            </View>

            <ScrollView style={{ marginTop: 14 }} contentContainerStyle={{ paddingBottom: 10 }}>
              {/* ESPÉCIE */}
              <Text style={{ fontWeight: "900", marginBottom: 8 }}>Espécie</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable style={filtroPill(tipoPetSelecionado === null)} onPress={() => setTipoPetSelecionado(null)}>
                  <Text style={{ fontWeight: "900" }}>Todos</Text>
                </Pressable>
                <Pressable
                  style={filtroPill(tipoPetSelecionado === "CACHORRO")}
                  onPress={() => setTipoPetSelecionado("CACHORRO")}
                >
                  <Text style={{ fontWeight: "900" }}>Cachorro</Text>
                </Pressable>
                <Pressable style={filtroPill(tipoPetSelecionado === "GATO")} onPress={() => setTipoPetSelecionado("GATO")}>
                  <Text style={{ fontWeight: "900" }}>Gato</Text>
                </Pressable>
              </View>

              {/* SEXO */}
              <Text style={{ fontWeight: "900", marginTop: 18, marginBottom: 8 }}>Sexo</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable style={filtroPill(sexoSelecionado === null)} onPress={() => setSexoSelecionado(null)}>
                  <Text style={{ fontWeight: "900" }}>Todos</Text>
                </Pressable>
                <Pressable style={filtroPill(sexoSelecionado === "M")} onPress={() => setSexoSelecionado("M")}>
                  <Text style={{ fontWeight: "900" }}>Macho</Text>
                </Pressable>
                <Pressable style={filtroPill(sexoSelecionado === "F")} onPress={() => setSexoSelecionado("F")}>
                  <Text style={{ fontWeight: "900" }}>Fêmea</Text>
                </Pressable>
              </View>

              {/* IDADE */}
              <Text style={{ fontWeight: "900", marginTop: 18, marginBottom: 8 }}>Idade (anos)</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#666", fontWeight: "700", marginBottom: 6 }}>Mín</Text>
                  <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 10 }}>
                    <TextInput value={idadeMin} onChangeText={setIdadeMin} keyboardType="numeric" placeholder="Ex: 1" />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#666", fontWeight: "700", marginBottom: 6 }}>Máx</Text>
                  <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 10 }}>
                    <TextInput value={idadeMax} onChangeText={setIdadeMax} keyboardType="numeric" placeholder="Ex: 8" />
                  </View>
                </View>
              </View>

              {/* TIPO PAYPET */}
              <Text style={{ fontWeight: "900", marginTop: 18, marginBottom: 8 }}>Tipo</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable style={filtroPill(tipoPayPetSelecionado === null)} onPress={() => setTipoPayPetSelecionado(null)}>
                  <Text style={{ fontWeight: "900" }}>Todos</Text>
                </Pressable>
                <Pressable
                  style={filtroPill(tipoPayPetSelecionado === "VENDA")}
                  onPress={() => setTipoPayPetSelecionado("VENDA")}
                >
                  <Text style={{ fontWeight: "900" }}>Venda</Text>
                </Pressable>
                <Pressable
                  style={filtroPill(tipoPayPetSelecionado === "DOACAO")}
                  onPress={() => setTipoPayPetSelecionado("DOACAO")}
                >
                  <Text style={{ fontWeight: "900" }}>Doação</Text>
                </Pressable>
              </View>

              {/* PREÇO */}
              <Text style={{ fontWeight: "900", marginTop: 18, marginBottom: 8 }}>Preço (R$)</Text>

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#666", fontWeight: "700", marginBottom: 6 }}>Mín</Text>
                  <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 10 }}>
                    <TextInput value={valorMin} onChangeText={setValorMin} keyboardType="numeric" placeholder="Ex: 50" />
                  </View>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#666", fontWeight: "700", marginBottom: 6 }}>Máx</Text>
                  <View style={{ backgroundColor: "#fff", borderRadius: 12, borderWidth: 1, borderColor: "#ddd", paddingHorizontal: 10 }}>
                    <TextInput value={valorMax} onChangeText={setValorMax} keyboardType="numeric" placeholder="Ex: 0" />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* AÇÕES */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable
                onPress={() => {
                  setTipoPetSelecionado(null);
                  setSexoSelecionado(null);
                  setTipoPayPetSelecionado(null);
                  setIdadeMin("");
                  setIdadeMax("");
                  setValorMin("");
                  setValorMax("");
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

      {/* Floating + */}
      <Pressable
        onPress={() => router.push({ pathname: "/anuncios/novo", params: { tipo: "paypet" } })}
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
