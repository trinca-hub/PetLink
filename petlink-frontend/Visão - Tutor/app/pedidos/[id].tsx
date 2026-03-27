import React, { useContext, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, Ionicons } from "@expo/vector-icons";

import { AuthContext } from "@/src/context/AuthContext";
import { getItensPorPedido, getPedidoById } from "@/src/api/pedidoService";
import { getProdutoById } from "@/src/api/produtoService";
import { ItemPedidoComProduto, PedidoDTO } from "@/src/types/pedido";

function formatMoneyBR(valor?: number) {
  if (valor == null || Number.isNaN(valor)) return "R$ 0,00";
  const s = Number(valor).toFixed(2).replace(".", ",");
  return `R$ ${s}`;
}

function formatDateBR(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PedidoDetalheScreen() {
  const { token } = useContext(AuthContext);
  const params = useLocalSearchParams<{ id?: string }>();

  const id = useMemo(() => Number(params.id), [params.id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pedido, setPedido] = useState<PedidoDTO | null>(null);
  const [itens, setItens] = useState<ItemPedidoComProduto[]>([]);

  const total = useMemo(() => {
    return itens.reduce((sum, item) => {
      const preco = Number(item.produto?.preco ?? 0);
      return sum + preco * Number(item.quantidade ?? 0);
    }, 0);
  }, [itens]);

  async function load() {
    if (!token) {
      setError("Faça login para visualizar os detalhes do pedido.");
      setItens([]);
      setPedido(null);
      return;
    }

    setError(null);

    const pedidoRes: any = await getPedidoById(id, token);
    if (!pedidoRes?.ok) {
      setError(pedidoRes?.data?.message || "Não foi possível carregar o pedido.");
      setItens([]);
      setPedido(null);
      return;
    }

    const pedidoData: PedidoDTO | null = pedidoRes?.data?.data ?? null;
    setPedido(pedidoData);

    const itensRes: any = await getItensPorPedido(id, token);
    if (!itensRes?.ok) {
      setError(itensRes?.data?.message || "Não foi possível carregar os itens do pedido.");
      setItens([]);
      return;
    }

    const rawItens: Array<{ id: number; pedidoId: number; produtoId: number; quantidade: number }> =
      Array.isArray(itensRes?.data?.data) ? itensRes.data.data : [];

    const enriched = await Promise.all(
      rawItens.map(async (item): Promise<ItemPedidoComProduto> => {
        const prodRes: any = await getProdutoById(item.produtoId, token);
        const produto = prodRes?.ok
          ? {
              id: Number(prodRes?.data?.data?.id ?? item.produtoId),
              nome: String(prodRes?.data?.data?.nome ?? `Produto ${item.produtoId}`),
              preco: Number(prodRes?.data?.data?.preco ?? 0),
              foto: prodRes?.data?.data?.foto,
            }
          : {
              id: item.produtoId,
              nome: `Produto ${item.produtoId}`,
              preco: 0,
            };

        return {
          ...item,
          produto,
        };
      })
    );

    setItens(enriched);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [id, token]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0B0B0F",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.75)", fontWeight: "800" }}>
          Carregando pedido...
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
          Pedido #{pedido?.id ?? id}
        </Text>
      </View>

      {!!error && (
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <Text style={{ color: "#ffb4b4", fontWeight: "800" }}>{error}</Text>
        </View>
      )}

      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.12)",
            borderRadius: 14,
            paddingVertical: 10,
            paddingHorizontal: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "800" }}>
            Data: {formatDateBR(pedido?.dataPedido)}
          </Text>
          <Text style={{ color: "#fff", fontWeight: "800", marginTop: 4 }}>
            Itens: {itens.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={itens}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120 }}
        ListEmptyComponent={() => (
          <View style={{ paddingTop: 20 }}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>Nenhum item encontrado neste pedido.</Text>
          </View>
        )}
        renderItem={({ item }) => {
          const preco = Number(item.produto?.preco ?? 0);
          const subtotal = preco * Number(item.quantidade ?? 0);

          return (
            <View
              style={{
                backgroundColor: "#fff",
                borderRadius: 16,
                padding: 12,
                marginBottom: 10,
                shadowOpacity: 0.1,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 6 },
                elevation: 3,
              }}
            >
              <View style={{ flexDirection: "row", gap: 10 }}>
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
                  {!!item.produto?.foto ? (
                    <Image
                      source={{ uri: item.produto.foto }}
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
                  <Text style={{ color: "#111", fontWeight: "900" }} numberOfLines={1}>
                    {item.produto?.nome ?? `Produto ${item.produtoId}`}
                  </Text>
                  <Text style={{ marginTop: 4, color: "#444", fontWeight: "700" }}>
                    {item.quantidade} x {formatMoneyBR(preco)}
                  </Text>
                  <Text style={{ marginTop: 4, color: "#0B3B91", fontWeight: "900" }}>
                    Subtotal: {formatMoneyBR(subtotal)}
                  </Text>
                </View>
              </View>
            </View>
          );
        }}
      />

      <View
        style={{
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          backgroundColor: "#fff",
          borderRadius: 999,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: "#111", fontWeight: "900" }}>Total do pedido</Text>
        <Text style={{ color: "#0B3B91", fontWeight: "900", fontSize: 16 }}>
          {formatMoneyBR(total)}
        </Text>
      </View>
    </LinearGradient>
  );
}
