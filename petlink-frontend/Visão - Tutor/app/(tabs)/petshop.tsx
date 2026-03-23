import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  TextInput,
  ScrollView,
  useWindowDimensions,
  Modal,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";

import { AuthContext } from "@/src/context/AuthContext";
import { getProdutos } from "@/src/api/produtoService";
import { getFavoriteProductIds, toggleFavoriteProduct } from "@/src/storage/favoritesProducts";

import { getCartProducts, setCartProducts, CartProductItem } from "@/src/storage/cartProducts";
import { criarPedido, criarItemPedido } from "@/src/api/pedidoService";

type ProdutoDTO = {
  id: number;
  nome: string;
  preco: number;
  descricao?: string;
  quantidade?: number; // estoque
  foto?: string;
};

function formatMoneyBR(valor?: number) {
  if (valor == null || Number.isNaN(valor)) return "";
  const s = Number(valor).toFixed(2).replace(".", ",");
  return `R$ ${s}`;
}

export default function Produtos() {
  const { token, user } = useContext(AuthContext);
  const { width } = useWindowDimensions();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
  const [search, setSearch] = useState("");

  // filtros
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [nomeFiltro, setNomeFiltro] = useState(""); // opcional (além da busca)
  const [precoMin, setPrecoMin] = useState("");
  const [precoMax, setPrecoMax] = useState("");

  // carrinho
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartProductItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [buying, setBuying] = useState(false);

  // favoritos
  const [favIds, setFavIds] = useState<number[]>([]);

  const GAP = 12;
  const CARD_W = useMemo(() => {
    const contentW = width - 16 * 2;
    return (contentW - GAP) / 2;
  }, [width]);

  const filtersCount = useMemo(() => {
    let c = 0;
    if (nomeFiltro.trim()) c++;
    if (precoMin.trim() || precoMax.trim()) c++;
    return c;
  }, [nomeFiltro, precoMin, precoMax]);

  async function load() {
    setError(null);

    const res: any = await getProdutos(token || undefined);
    if (!res?.ok) {
      setError(res?.data?.message || "Erro ao buscar produtos");
      setProdutos([]);
      return;
    }

    const list = Array.isArray(res.data?.data) ? res.data.data : [];
    setProdutos(list);

    if (user?.id) {
      const fav = await getFavoriteProductIds(user.id);
      setFavIds(fav);
    }
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, []);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  function toggleSelect(produtoId: number) {
    setSelectedIds((prev) =>
      prev.includes(produtoId) ? prev.filter((id) => id !== produtoId) : [...prev, produtoId]
    );
  }

  function isSelected(produtoId: number) {
    return selectedIds.includes(produtoId);
  }

  const totalSelecionado = useMemo(() => {
    return cartItems
      .filter((x) => selectedIds.includes(x.produtoId))
      .reduce((sum, x: any) => sum + Number(x.preco) * Number(x.quantidade), 0);
  }, [cartItems, selectedIds]);

  // ✅ helper: pega estoque atual do produto (pelo feed)
  function getEstoqueAtual(produtoId: number) {
    const p = produtos.find((x) => x.id === produtoId);
    return Number(p?.quantidade ?? 0);
  }

  async function openCart() {
    if (!user?.id) return Alert.alert("Login", "Faça login para ver o carrinho.");

    const items = await getCartProducts(user.id);

    // ✅ garante que cada item tem estoque atualizado
    const withStock = items.map((it: any) => {
      const estoqueAtual = Number(it.estoque ?? getEstoqueAtual(it.produtoId));
      const quantidadeAtual = Math.min(Number(it.quantidade ?? 1), estoqueAtual || 0);

      return {
        ...it,
        estoque: estoqueAtual,
        quantidade: Math.max(1, quantidadeAtual || 1),
      };
    });

    setCartItems(withStock);
    setSelectedIds(withStock.map((x) => x.produtoId)); // abre já selecionado
    setCartOpen(true);
  }

  // ✅ − e + no carrinho (com trava no estoque)
  async function decQty(produtoId: number) {
    if (!user?.id) return;

    const next = cartItems.map((x: any) =>
      x.produtoId !== produtoId
        ? x
        : { ...x, quantidade: Math.max(1, Number(x.quantidade) - 1) }
    );

    setCartItems(next);
    await setCartProducts(user.id, next);
  }

  async function incQty(produtoId: number) {
    if (!user?.id) return;

    const next = cartItems.map((x: any) => {
      if (x.produtoId !== produtoId) return x;

      const estoque = Number(x.estoque ?? getEstoqueAtual(x.produtoId));
      const q = Number(x.quantidade ?? 1);
      const nextQty = Math.min(q + 1, estoque);

      return { ...x, estoque, quantidade: nextQty };
    });

    setCartItems(next);
    await setCartProducts(user.id, next);
  }

  async function finalizarCompraSelecionados() {
    if (!user?.id || !token) return Alert.alert("Login", "Faça login para comprar.");

    const items = cartItems.filter((x) => selectedIds.includes(x.produtoId));
    if (items.length === 0) return Alert.alert("Carrinho", "Selecione pelo menos 1 produto.");

    // ✅ valida estoque REAL (com base no feed atual)
    for (const it of items as any[]) {
      const estoqueAtual = getEstoqueAtual(it.produtoId);

      if (estoqueAtual <= 0) {
        return Alert.alert("Estoque", `${it.nome} está esgotado.`);
      }
      if (Number(it.quantidade) > estoqueAtual) {
        return Alert.alert(
          "Estoque insuficiente",
          `${it.nome} tem apenas ${estoqueAtual} em estoque.`
        );
      }
    }

    setBuying(true);
    try {
      // 1) cria pedido
      const pedidoRes: any = await criarPedido(
        { usuarioId: user.id, dataPedido: new Date().toISOString() },
        token
      );

      console.log("[PEDIDO] resposta criarPedido:", JSON.stringify(pedidoRes?.data, null, 2));

      if (!pedidoRes?.ok) {
        return Alert.alert("Erro", pedidoRes?.data?.message || "Erro ao criar pedido.");
      }

      const body = pedidoRes?.data;

      // tenta pegar em vários formatos comuns
      let pedidoId: any =
        body?.data?.id ??
        body?.data?.Id ??
        body?.data?.pedidoId ??
        body?.data?.PedidoId ??
        body?.id ??
        body?.Id;

      // se o backend devolveu array por algum motivo
      if (!pedidoId && Array.isArray(body?.data) && body.data.length > 0) {
        pedidoId = body.data[0]?.id ?? body.data[0]?.Id;
      }

      pedidoId = Number(pedidoId);

      if (!pedidoId || Number.isNaN(pedidoId)) {
        console.log("[PEDIDO] body sem id:", JSON.stringify(body, null, 2));
        return Alert.alert("Erro", "Pedido criado, mas não retornou o ID.");
      }


      // 2) cria itens do pedido (só os selecionados)
      for (const it of items as any[]) {
        const itemRes: any = await criarItemPedido(
          { pedidoId: Number(pedidoId), produtoId: it.produtoId, quantidade: Number(it.quantidade) },
          token
        );

        if (!itemRes?.ok) {
          return Alert.alert("Erro", itemRes?.data?.message || `Erro ao adicionar: ${it.nome}`);
        }
      }

      // 3) remove do carrinho só os selecionados
      const remaining = cartItems.filter((x) => !selectedIds.includes(x.produtoId));
      await setCartProducts(user.id, remaining);

      setCartItems(remaining);
      setSelectedIds([]);

      Alert.alert("Sucesso", "Compra realizada!");
      setCartOpen(false);

      // 4) recarrega produtos pra refletir estoque
      await load();
    } finally {
      setBuying(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const nf = nomeFiltro.trim().toLowerCase();

    const min = precoMin.trim() === "" ? null : Number(precoMin);
    const max = precoMax.trim() === "" ? null : Number(precoMax);

    return produtos.filter((p) => {
      if (q) {
        const ok =
          String(p.nome ?? "").toLowerCase().includes(q) ||
          String(p.descricao ?? "").toLowerCase().includes(q);
        if (!ok) return false;
      }

      if (nf) {
        if (!String(p.nome ?? "").toLowerCase().includes(nf)) return false;
      }

      const preco = Number(p.preco ?? 0);
      if (min != null && !Number.isNaN(min) && preco < min) return false;
      if (max != null && !Number.isNaN(max) && preco > max) return false;

      return true;
    });
  }, [produtos, search, nomeFiltro, precoMin, precoMax]);

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (nomeFiltro.trim())
      chips.push({ key: "nome", label: `Nome: ${nomeFiltro}`, onRemove: () => setNomeFiltro("") });
    if (precoMin.trim() || precoMax.trim())
      chips.push({
        key: "preco",
        label: `Preço: ${precoMin || "0"}–${precoMax || "∞"}`,
        onRemove: () => {
          setPrecoMin("");
          setPrecoMax("");
        },
      });
    return chips;
  }, [nomeFiltro, precoMin, precoMax]);

  async function onToggleFav(produtoId: number) {
    if (!user?.id) return;
    const next = await toggleFavoriteProduct(user.id, produtoId);
    setFavIds(next);
  }

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Carregando PetShop...</Text>
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
          onPress={() => { }}
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
          PetShop
        </Text>
      </View>

      {/* Search + filtros + carrinho */}
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

        <View
          style={{
            marginTop: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable onPress={() => setFiltersOpen(true)} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="funnel" size={18} color="#fff" />
            <Text style={{ color: "#fff", fontWeight: "800" }}>Filtros({filtersCount})</Text>
          </Pressable>

          <Pressable
            onPress={openCart}
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              backgroundColor: "#fff",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.06)",
            }}
          >
            <Ionicons name="cart-outline" size={18} color="#0E2B5A" />
          </Pressable>
        </View>

        {activeChips.length > 0 && (
          <View style={{ marginTop: 10, flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
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
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ gap: GAP }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 110 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={() => (
          <View style={{ paddingTop: 20 }}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>Nenhum produto encontrado</Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
              Tente mudar a pesquisa ou os filtros.
            </Text>
          </View>
        )}
        renderItem={({ item }) => {
          const isFav = favIds.includes(item.id);
          const semEstoque = (item.quantidade ?? 0) <= 0;

          return (
            <Pressable
              onPress={() => router.push(`/produtos/${item.id}`)}
              style={{
                width: CARD_W,
                backgroundColor: "#fff",
                borderRadius: 18,
                padding: 10,
                marginBottom: GAP,
                shadowOpacity: 0.10,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
                elevation: 3,
                opacity: semEstoque ? 0.75 : 1,
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
                {!!item.foto ? (
                  <Image
                    source={{ uri: item.foto }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <Ionicons name="image" size={26} color="#999" />
                  </View>
                )}

                {/* Favorito */}
                <Pressable
                  onPress={() => onToggleFav(item.id)}
                  style={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.95)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons
                    name={isFav ? "heart" : "heart-outline"}
                    size={18}
                    color={isFav ? "#D11A2A" : "#0E2B5A"}
                  />
                </Pressable>
              </View>

              {/* Nome */}
              <Text numberOfLines={1} style={{ marginTop: 10, fontWeight: "900", fontSize: 16, color: "#111" }}>
                {item.nome}
              </Text>

              {/* Preço */}
              <View style={{ marginTop: 6, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: "900", fontSize: 16, color: "#0B3B91" }}>
                  {formatMoneyBR(item.preco)}
                </Text>

                {semEstoque && (
                  <View style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, backgroundColor: "rgba(0,0,0,0.06)", borderWidth: 1, borderColor: "rgba(0,0,0,0.12)" }}>
                    <Text style={{ fontWeight: "900", color: "#333", fontSize: 12 }}>Esgotado</Text>
                  </View>
                )}
              </View>
            </Pressable>
          );
        }}
      />

      {/* Modal filtros */}
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
              <Text style={{ fontWeight: "900", marginBottom: 8 }}>Nome contém</Text>
              <View style={{ backgroundColor: "#F2F2F7", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
                <TextInput
                  value={nomeFiltro}
                  onChangeText={setNomeFiltro}
                  placeholder="Ex: ração"
                  placeholderTextColor="#8E8E93"
                  style={{ color: "#111", fontWeight: "700" }}
                />
              </View>

              <Text style={{ fontWeight: "900", marginTop: 16, marginBottom: 8 }}>Preço</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1, backgroundColor: "#F2F2F7", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
                  <TextInput
                    value={precoMin}
                    onChangeText={setPrecoMin}
                    keyboardType="numeric"
                    placeholder="Mín"
                    placeholderTextColor="#8E8E93"
                    style={{ color: "#111", fontWeight: "700" }}
                  />
                </View>
                <View style={{ flex: 1, backgroundColor: "#F2F2F7", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 }}>
                  <TextInput
                    value={precoMax}
                    onChangeText={setPrecoMax}
                    keyboardType="numeric"
                    placeholder="Máx"
                    placeholderTextColor="#8E8E93"
                    style={{ color: "#111", fontWeight: "700" }}
                  />
                </View>
              </View>
            </ScrollView>

            <View style={{ flexDirection: "row", gap: 10, marginTop: 14 }}>
              <Pressable
                onPress={() => {
                  setNomeFiltro("");
                  setPrecoMin("");
                  setPrecoMax("");
                }}
                style={{ flex: 1, borderWidth: 1, borderColor: "#ddd", borderRadius: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ fontWeight: "900" }}>Limpar</Text>
              </Pressable>

              <Pressable
                onPress={() => setFiltersOpen(false)}
                style={{ flex: 1, backgroundColor: "#0B3B91", borderRadius: 12, paddingVertical: 12, alignItems: "center", justifyContent: "center" }}
              >
                <Text style={{ color: "#fff", fontWeight: "900" }}>Aplicar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Drawer Carrinho */}
      <Modal visible={cartOpen} transparent animationType="fade" onRequestClose={() => setCartOpen(false)}>
        <Pressable onPress={() => setCartOpen(false)} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)" }}>
          <Pressable
            onPress={() => { }}
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: "82%",
              backgroundColor: "#fff",
              paddingTop: 14,
              paddingHorizontal: 14,
              borderTopLeftRadius: 18,
              borderBottomLeftRadius: 18,
            }}
          >
            {/* header */}
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 18, fontWeight: "900", color: "#111" }}>Carrinho</Text>
              <Pressable onPress={() => setCartOpen(false)}>
                <Ionicons name="close" size={24} color="#111" />
              </Pressable>
            </View>

            {/* lista */}
            <View style={{ marginTop: 12, flex: 1 }}>
              {cartItems.length === 0 ? (
                <View style={{ paddingTop: 20 }}>
                  <Text style={{ fontWeight: "900", color: "#111" }}>Seu carrinho está vazio.</Text>
                  <Text style={{ marginTop: 6, color: "#444", fontWeight: "700" }}>Adicione produtos para comprar.</Text>
                </View>
              ) : (
                <FlatList
                  data={cartItems}
                  keyExtractor={(i: any) => String(i.produtoId)}
                  contentContainerStyle={{ paddingBottom: 140 }}
                  renderItem={({ item }: any) => {
                    const checked = isSelected(item.produtoId);
                    const estoque = Number(item.estoque ?? getEstoqueAtual(item.produtoId));
                    const travado = Number(item.quantidade) >= estoque;

                    return (
                      <View
                        style={{
                          paddingVertical: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: "rgba(0,0,0,0.06)",
                        }}
                      >
                        <Pressable
                          onPress={() => toggleSelect(item.produtoId)}
                          style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                        >
                          {/* checkbox */}
                          <View
                            style={{
                              width: 26,
                              height: 26,
                              borderRadius: 8,
                              borderWidth: 2,
                              borderColor: checked ? "#0B3B91" : "rgba(0,0,0,0.25)",
                              backgroundColor: checked ? "rgba(11,59,145,0.12)" : "transparent",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {checked && <Ionicons name="checkmark" size={18} color="#0B3B91" />}
                          </View>

                          {/* foto */}
                          <View
                            style={{
                              width: 56,
                              height: 56,
                              borderRadius: 12,
                              overflow: "hidden",
                              backgroundColor: "#F2F2F7",
                              borderWidth: 1,
                              borderColor: "rgba(0,0,0,0.06)",
                            }}
                          >
                            {!!item.foto ? (
                              <Image
                                source={{ uri: item.foto }}
                                style={{ width: "100%", height: "100%" }}
                                resizeMode="contain"
                              />
                            ) : (
                              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                                <Ionicons name="image" size={18} color="#999" />
                              </View>
                            )}
                          </View>

                          {/* info */}
                          <View style={{ flex: 1 }}>
                            <Text numberOfLines={1} style={{ fontWeight: "900", color: "#111" }}>
                              {item.nome}
                            </Text>

                            <Text style={{ marginTop: 4, fontWeight: "900", color: "#0B3B91" }}>
                              {formatMoneyBR(item.preco)}
                            </Text>

                            <Text style={{ marginTop: 2, fontWeight: "700", color: "#444", fontSize: 12 }}>
                              Em estoque: {estoque}
                            </Text>
                          </View>
                        </Pressable>

                        {/* ✅ CONTROLE + / − */}
                        <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Pressable
                              onPress={() => decQty(item.produtoId)}
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                backgroundColor: "rgba(0,0,0,0.06)",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Ionicons name="remove" size={18} color="#0E2B5A" />
                            </Pressable>

                            <Text style={{ minWidth: 22, textAlign: "center", fontWeight: "900", color: "#111" }}>
                              {item.quantidade}
                            </Text>

                            <Pressable
                              onPress={() => incQty(item.produtoId)}
                              disabled={travado || estoque <= 0}
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                backgroundColor: travado || estoque <= 0 ? "rgba(0,0,0,0.03)" : "rgba(28,102,255,0.14)",
                                borderWidth: 1,
                                borderColor: travado || estoque <= 0 ? "rgba(0,0,0,0.08)" : "rgba(28,102,255,0.35)",
                                alignItems: "center",
                                justifyContent: "center",
                                opacity: travado || estoque <= 0 ? 0.6 : 1,
                              }}
                            >
                              <Ionicons name="add" size={18} color="#0E2B5A" />
                            </Pressable>
                          </View>

                          {travado && estoque > 0 && (
                            <Text style={{ fontSize: 12, fontWeight: "800", color: "#B00020" }}>
                              Limite do estoque
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  }}
                />
              )}
            </View>

            {/* footer */}
            <View
              style={{
                position: "absolute",
                left: 14,
                right: 14,
                bottom: 14,
                backgroundColor: "#fff",
                paddingTop: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontWeight: "900", color: "#111" }}>Total selecionado</Text>
                <Text style={{ fontWeight: "900", color: "#0B3B91", fontSize: 16 }}>
                  {formatMoneyBR(totalSelecionado)}
                </Text>
              </View>

              <Pressable
                disabled={buying || selectedIds.length === 0}
                onPress={finalizarCompraSelecionados}
                style={{
                  marginTop: 10,
                  backgroundColor: buying || selectedIds.length === 0 ? "rgba(11,59,145,0.35)" : "#0B3B91",
                  borderRadius: 999,
                  paddingVertical: 12,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {buying ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "900" }}>Finalizar compra</Text>}
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </LinearGradient>
  );
}
