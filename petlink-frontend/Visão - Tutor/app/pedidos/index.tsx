import React, { useContext, useEffect, useState } from "react";
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

import { AuthContext } from "@/src/context/AuthContext";
import { getItensPorPedido, getPedidosByUsuario } from "@/src/api/pedidoService";
import { getProdutoById } from "@/src/api/produtoService";
import { PedidoDTO, PedidoResumo } from "@/src/types/pedido";

function formatMoneyBR(valor?: number) {
  if (valor == null || isNaN(Number(valor))) return "R$ 0,00";
  const s = Number(valor).toFixed(2).replace(".", ",");
  return `R$ ${s}`;
}

function formatDateBR(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function PedidosScreen() {
  const { token, user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidos, setPedidos] = useState<PedidoResumo[]>([]);

  async function loadPedidos() {
    if (!user?.id || !token) {
      setError("Faça login para visualizar seus pedidos.");
      setPedidos([]);
      return;
    }

    setError(null);

    const pedidosRes: any = await getPedidosByUsuario(user.id, token);
    if (!pedidosRes?.ok) {
      setError(pedidosRes?.data?.message || "Não foi possível carregar seus pedidos.");
      setPedidos([]);
      return;
    }

    const list: PedidoDTO[] = Array.isArray(pedidosRes?.data?.data) ? pedidosRes.data.data : [];

    const ordered = [...list].sort(
      (a, b) => new Date(b.dataPedido).getTime() - new Date(a.dataPedido).getTime()
    );

    const summaries = await Promise.all(
      ordered.map(async (pedido): Promise<PedidoResumo> => {
        const itensRes: any = await getItensPorPedido(pedido.id, token);
        const itens: Array<{ produtoId: number; quantidade: number }> = Array.isArray(
          itensRes?.data?.data
        )
          ? itensRes.data.data
          : [];

        const products = await Promise.all(
          itens.map(async (item) => {
            const prodRes: any = await getProdutoById(item.produtoId, token);
            const preco = Number(prodRes?.data?.data?.preco ?? 0);
            return preco * Number(item.quantidade ?? 0);
          })
        );

        const total = products.reduce((acc: number, current: number) => acc + current, 0);

        return {
          pedido,
          itensCount: itens.length,
          total,
        };
      })
    );

    setPedidos(summaries);
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadPedidos();
      setLoading(false);
    })();
  }, [user?.id, token]);

  async function onRefresh() {
    setRefreshing(true);
    await loadPedidos();
    setRefreshing(false);
  }

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
          Carregando pedidos...
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
          Meus Pedidos
        </Text>
      </View>

      {!!error && (
        <View style={{ paddingHorizontal: 16, marginTop: 10 }}>
          <Text style={{ color: "#ffb4b4", fontWeight: "800" }}>{error}</Text>
        </View>
      )}

      <FlatList
        data={pedidos}
        keyExtractor={(item: PedidoResumo) => String(item.pedido.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 26 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        ListEmptyComponent={() => (
          <View style={{ paddingTop: 24 }}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>Nenhum pedido encontrado</Text>
            <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
              Você ainda não realizou compras no PetShop.
            </Text>
          </View>
        )}
        renderItem={({ item }: { item: PedidoResumo }) => (
          <Pressable
            onPress={() => router.push(`/pedidos/${item.pedido.id}`)}
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
                Pedido #{item.pedido.id}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#0E2B5A" />
            </View>

            <Text style={{ marginTop: 6, color: "#444", fontWeight: "700" }}>
              Data: {formatDateBR(item.pedido.dataPedido)}
            </Text>

            <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: "#444", fontWeight: "700" }}>{item.itensCount} item(ns)</Text>
              <Text style={{ color: "#0B3B91", fontWeight: "900", fontSize: 16 }}>
                {formatMoneyBR(item.total)}
              </Text>
            </View>
          </Pressable>
        )}
      />
    </LinearGradient>
  );
}
