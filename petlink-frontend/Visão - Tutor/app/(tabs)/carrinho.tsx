import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { AuthContext } from "@/src/context/AuthContext";
import { useSideMenu } from "@/src/context/SideMenuContext";
import { getProdutos } from "@/src/api/produtoService";
import {
  CartProductItem,
  getCartProducts,
  removeCartProduct,
  setCartProducts,
} from "@/src/storage/cartProducts";
import { checkoutFromItems } from "@/src/services/checkoutService";

type ProdutoDTO = {
  id: number;
  nome: string;
  preco: number;
  quantidade?: number;
  foto?: string;
};

function formatMoneyBR(valor?: number) {
  if (valor == null || Number.isNaN(valor)) return "";
  const s = Number(valor).toFixed(2).replace(".", ",");
  return `R$ ${s}`;
}

function summarizeFailures(names: string[]) {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return `${names.slice(0, 2).join(", ")}${names.length > 2 ? "..." : ""}`;
}

export default function Carrinho() {
  const { token, user } = useContext(AuthContext);
  const { openMenu } = useSideMenu();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);

  const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
  const [cartItems, setCartItems] = useState<CartProductItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  function getEstoqueAtual(produtoId: number) {
    const p = produtos.find((x) => x.id === produtoId);
    return Number(p?.quantidade ?? 0);
  }

  function isUnavailable(item: CartProductItem) {
    const estoque = Number(item.estoque ?? getEstoqueAtual(item.produtoId));
    return estoque <= 0 || Number(item.quantidade) <= 0;
  }

  async function load() {
    if (!user?.id) {
      setCartItems([]);
      setSelectedIds([]);
      setLoading(false);
      return;
    }

    setError(null);
    const res: any = await getProdutos(token || undefined);
    if (!res?.ok) {
      setError(res?.data?.message || "Erro ao buscar produtos");
    }

    const list = Array.isArray(res?.data?.data) ? res.data.data : [];
    setProdutos(list);

    const items = await getCartProducts(user.id);
    const withStock = items.map((it: CartProductItem) => {
      const estoqueAtual = Number(it.estoque ?? list.find((p: ProdutoDTO) => p.id === it.produtoId)?.quantidade ?? 0);
      const quantidadeInformada = Number(it.quantidade ?? 1);
      const quantidadeAtual =
        estoqueAtual <= 0
          ? 0
          : Math.min(Math.max(1, quantidadeInformada || 1), estoqueAtual);

      return {
        ...it,
        estoque: estoqueAtual,
        quantidade: quantidadeAtual,
      };
    });

    await setCartProducts(user.id, withStock);
    setCartItems(withStock);
    setSelectedIds(withStock.filter((x) => !isUnavailable(x)).map((x) => x.produtoId));
    setLoading(false);
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
    }, [user?.id, token])
  );

  function toggleSelect(produtoId: number) {
    setSelectedIds((prev) =>
      prev.includes(produtoId) ? prev.filter((id) => id !== produtoId) : [...prev, produtoId]
    );
  }

  async function decQty(produtoId: number) {
    if (!user?.id) return;

    const next = cartItems.map((x) => {
      if (x.produtoId !== produtoId) return x;

      const estoque = Number(x.estoque ?? getEstoqueAtual(x.produtoId));
      if (estoque <= 0) return { ...x, estoque, quantidade: 0 };

      return { ...x, estoque, quantidade: Math.max(1, Number(x.quantidade) - 1) };
    });

    setCartItems(next);
    await setCartProducts(user.id, next);
  }

  async function incQty(produtoId: number) {
    if (!user?.id) return;

    const next = cartItems.map((x) => {
      if (x.produtoId !== produtoId) return x;

      const estoque = Number(x.estoque ?? getEstoqueAtual(x.produtoId));
      if (estoque <= 0) return { ...x, estoque, quantidade: 0 };

      const q = Number(x.quantidade ?? 1);
      const nextQty = Math.min(q + 1, estoque);

      return { ...x, estoque, quantidade: nextQty };
    });

    setCartItems(next);
    await setCartProducts(user.id, next);
  }

  async function removeItem(produtoId: number) {
    if (!user?.id) return;

    const next = await removeCartProduct(user.id, produtoId);
    setCartItems(next);
    setSelectedIds((prev) => prev.filter((id) => id !== produtoId));
  }

  const totalSelecionado = useMemo(() => {
    return cartItems
      .filter((x) => selectedIds.includes(x.produtoId) && Number(x.quantidade) > 0)
      .reduce((sum, x) => sum + Number(x.preco) * Number(x.quantidade), 0);
  }, [cartItems, selectedIds]);

  async function finalizarCompraSelecionados() {
    if (!user?.id || !token) return Alert.alert("Login", "Faça login para comprar.");

    const initiallySelected = cartItems.filter((x) => selectedIds.includes(x.produtoId));
    if (initiallySelected.length === 0) return Alert.alert("Carrinho", "Selecione pelo menos 1 produto.");

    const withStock = initiallySelected.map((item) => {
      const estoqueAtual = Number(item.estoque ?? getEstoqueAtual(item.produtoId));
      const quantidadeAtual = Math.min(Math.max(1, Number(item.quantidade ?? 1)), estoqueAtual || 0);
      return {
        ...item,
        estoque: estoqueAtual,
        quantidade: estoqueAtual <= 0 ? 0 : quantidadeAtual,
      };
    });

    const validItems = withStock.filter((x) => Number(x.quantidade) > 0 && Number(x.estoque) > 0);
    if (validItems.length === 0) {
      return Alert.alert("Carrinho", "Nenhum item válido restou selecionado para finalizar.");
    }

    setBuying(true);

    try {
      const checkout = await checkoutFromItems(
        user.id,
        token,
        validItems.map((x) => ({
          produtoId: x.produtoId,
          quantidade: Number(x.quantidade),
        }))
      );

      const confirmedIds = new Set(checkout.confirmedItems.map((item) => item.produtoId));
      const remaining = cartItems.filter((item) => !confirmedIds.has(item.produtoId));
      setCartItems(remaining);
      await setCartProducts(user.id, remaining);

      if (!checkout.ok) {
        const msg = checkout.generalError || "Falha ao concluir compra dos itens selecionados.";
        Alert.alert("Erro", msg);
        return;
      }

      if (checkout.status === "partial") {
        const failedNames = checkout.failedItems.map((f) => f.item.nome);
        Alert.alert(
          "Compra parcial",
          `Itens confirmados: ${checkout.confirmedItems.length}. Falhas em: ${summarizeFailures(
            failedNames
          )}`
        );
      } else {
        Alert.alert("Sucesso", "Compra realizada com sucesso!");
      }

      setSelectedIds(remaining.filter((x) => !isUnavailable(x)).map((x) => x.produtoId));
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível finalizar sua compra.");
    } finally {
      setBuying(false);
    }
  }

  return (
    <LinearGradient
      colors={["#0B0B0F", "#0E2B5A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
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
            Carrinho
          </Text>
        </View>

        <View
          style={{
            marginTop: 14,
            marginHorizontal: 16,
            backgroundColor: "#fff",
            borderRadius: 22,
            padding: 14,
            flex: 1,
          }}
        >
          {loading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" />
              <Text style={{ marginTop: 10, fontWeight: "800" }}>Carregando carrinho...</Text>
            </View>
          ) : error ? (
            <View style={{ paddingTop: 8 }}>
              <Text style={{ color: "#B00020", fontWeight: "800" }}>{error}</Text>
            </View>
          ) : cartItems.length === 0 ? (
            <View style={{ paddingTop: 16 }}>
              <Text style={{ fontWeight: "900", color: "#111" }}>Seu carrinho está vazio.</Text>
              <Text style={{ marginTop: 6, color: "#444", fontWeight: "700" }}>
                Adicione produtos para comprar.
              </Text>
            </View>
          ) : (
            <FlatList
              data={cartItems}
              keyExtractor={(i) => String(i.produtoId)}
              contentContainerStyle={{ paddingBottom: 140 }}
              renderItem={({ item }) => {
                const checked = selectedIds.includes(item.produtoId);
                const estoque = Number(item.estoque ?? getEstoqueAtual(item.produtoId));
                const indisponivel = estoque <= 0 || Number(item.quantidade) <= 0;
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
                      onPress={() => {
                        if (indisponivel) return;
                        toggleSelect(item.produtoId);
                      }}
                      style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
                    >
                      <View
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: indisponivel
                            ? "rgba(0,0,0,0.12)"
                            : checked
                            ? "#0B3B91"
                            : "rgba(0,0,0,0.25)",
                          backgroundColor: checked ? "rgba(11,59,145,0.12)" : "transparent",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {checked && <Ionicons name="checkmark" size={18} color="#0B3B91" />}
                      </View>

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

                    <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Pressable
                          onPress={() => decQty(item.produtoId)}
                          disabled={indisponivel || Number(item.quantidade) <= 1}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            backgroundColor:
                              indisponivel || Number(item.quantidade) <= 1
                                ? "rgba(0,0,0,0.03)"
                                : "rgba(0,0,0,0.06)",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: indisponivel || Number(item.quantidade) <= 1 ? 0.6 : 1,
                          }}
                        >
                          <Ionicons name="remove" size={18} color="#0E2B5A" />
                        </Pressable>

                        <Text style={{ minWidth: 22, textAlign: "center", fontWeight: "900", color: "#111" }}>
                          {item.quantidade}
                        </Text>

                        <Pressable
                          onPress={() => incQty(item.produtoId)}
                          disabled={indisponivel || travado || estoque <= 0}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            backgroundColor: indisponivel || travado || estoque <= 0 ? "rgba(0,0,0,0.03)" : "rgba(28,102,255,0.14)",
                            borderWidth: 1,
                            borderColor: indisponivel || travado || estoque <= 0 ? "rgba(0,0,0,0.08)" : "rgba(28,102,255,0.35)",
                            alignItems: "center",
                            justifyContent: "center",
                            opacity: indisponivel || travado || estoque <= 0 ? 0.6 : 1,
                          }}
                        >
                          <Ionicons name="add" size={18} color="#0E2B5A" />
                        </Pressable>
                      </View>

                      {indisponivel ? (
                        <Text style={{ fontSize: 12, fontWeight: "800", color: "#B00020" }}>
                          Indisponível
                        </Text>
                      ) : travado && estoque > 0 ? (
                        <Text style={{ fontSize: 12, fontWeight: "800", color: "#B00020" }}>
                          Limite do estoque
                        </Text>
                      ) : null}
                    </View>

                    <Pressable
                      onPress={() => removeItem(item.produtoId)}
                      style={{ marginTop: 8, alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 6 }}
                    >
                      <Ionicons name="trash-outline" size={16} color="#B00020" />
                      <Text style={{ color: "#B00020", fontWeight: "800", fontSize: 12 }}>Remover</Text>
                    </Pressable>
                  </View>
                );
              }}
            />
          )}

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
              {buying ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={{ color: "#fff", fontWeight: "900" }}>Finalizar compra</Text>
              )}
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
