import React, { useContext, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Image, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";

import { AuthContext } from "@/src/context/AuthContext";
import { getProdutoById } from "@/src/api/produtoService";
import { addToCartProducts, getCartProducts, clearCartProducts } from "@/src/storage/cartProducts";
import { criarPedido, criarItemPedido } from "@/src/api/pedidoService";

type ProdutoDTO = {
    id: number;
    nome: string;
    preco: number;
    descricao?: string;
    quantidade?: number;
    foto?: string;
};

function formatMoneyBR(valor?: number) {
    if (valor == null || Number.isNaN(valor)) return "";
    const s = Number(valor).toFixed(2).replace(".", ",");
    return `R$ ${s}`;
}

export default function ProdutoDetalhe() {
    const { token, user } = useContext(AuthContext);
    const params = useLocalSearchParams<{ id?: string }>();

    const id = useMemo(() => Number(params.id), [params.id]);

    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [data, setData] = useState<ProdutoDTO | null>(null);

    async function load() {
        const res: any = await getProdutoById(id, token || undefined);
        if (!res?.ok) {
            Alert.alert("Erro", res?.data?.message || "Não foi possível carregar o produto.");
            setData(null);
            return;
        }
        const prod = res?.data?.data ?? null;
        setData(prod);
    }

    useEffect(() => {
        (async () => {
            setLoading(true);
            await load();
            setLoading(false);
        })();
    }, [id]);

    const semEstoque = (data?.quantidade ?? 0) <= 0;

    async function addCarrinho() {
        if (!user?.id || !data) return;
        if (semEstoque) return Alert.alert("Sem estoque", "Esse produto está esgotado.");

        await addToCartProducts(user.id, {
            produtoId: data.id,
            nome: data.nome,
            preco: data.preco,
            foto: data.foto,
            estoque: data.quantidade,
        }, 1);

        Alert.alert("Pronto!", "Adicionado ao carrinho.");
    }

    // Compra simples: compra tudo do carrinho (1 item ou vários)
    async function comprarAgora() {
        if (!user?.id) return Alert.alert("Login", "Faça login para comprar.");
        if (!token) return Alert.alert("Login", "Token não encontrado.");
        if (semEstoque) return Alert.alert("Sem estoque", "Esse produto está esgotado.");

        setPosting(true);
        try {
            // garante que o produto está no carrinho (pra simplificar)
            await addToCartProducts(user.id, {
                produtoId: data!.id,
                nome: data!.nome,
                preco: data!.preco,
                foto: data!.foto,
                estoque: data!.quantidade,
            }, 1);

            const cart = await getCartProducts(user.id);

            // valida estoque local (evita comprar mais do que tem)
            for (const it of cart) {
                if (it.estoque != null && it.quantidade > it.estoque) {
                    setPosting(false);
                    return Alert.alert("Estoque", `Quantidade acima do estoque para: ${it.nome}`);
                }
            }

            // 1) cria pedido
            const pedidoRes: any = await criarPedido(
                { usuarioId: user.id, dataPedido: new Date().toISOString() },
                token
            );

            if (!pedidoRes?.ok) {
                setPosting(false);
                return Alert.alert("Erro", pedidoRes?.data?.message || "Erro ao criar pedido.");
            }

            const pedidoId = pedidoRes?.data?.data?.id ?? pedidoRes?.data?.data?.Id ?? pedidoRes?.data?.id;
            if (!pedidoId) {
                setPosting(false);
                return Alert.alert("Erro", "Pedido criado, mas não retornou o ID.");
            }

            // 2) cria itens do pedido
            for (const it of cart) {
                const itemRes: any = await criarItemPedido(
                    { pedidoId: Number(pedidoId), produtoId: it.produtoId, quantidade: it.quantidade },
                    token
                );
                if (!itemRes?.ok) {
                    setPosting(false);
                    return Alert.alert("Erro", itemRes?.data?.message || `Erro ao adicionar item: ${it.nome}`);
                }
            }

            // 3) limpa carrinho e recarrega o produto (pra pegar estoque novo)
            await clearCartProducts(user.id);
            await load();

            Alert.alert("Sucesso", "Compra realizada!");
            router.back();
        } finally {
            setPosting(false);
        }
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Carregando produto...</Text>
            </View>
        );
    }

    if (!data) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
                <Text>Produto não encontrado.</Text>
                <Pressable onPress={() => router.back()} style={{ marginTop: 12 }}>
                    <Text style={{ fontWeight: "900" }}>Voltar</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <LinearGradient colors={["#0B0B0F", "#0E2B5A"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
            {/* Header */}
            <View style={{ paddingTop: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Pressable onPress={() => router.back()} style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" }}>
                    <Feather name="arrow-left" size={22} color="#fff" />
                </Pressable>
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>Produto</Text>
                <View style={{ width: 40, height: 40 }} />
            </View>

            <View style={{ padding: 16 }}>
                {/* FOTO (sem distorcer) */}
                <View
                    style={{
                        width: "100%",
                        height: 260,
                        borderRadius: 18,
                        overflow: "hidden",
                        backgroundColor: "#F2F2F7",
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.06)",
                    }}
                >
                    {!!data.foto ? (
                        <Image
                            source={{ uri: data.foto }}
                            style={{ width: "100%", height: "100%" }}
                            resizeMode="contain"   // ✅ não distorce
                        />
                    ) : (
                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                            <Ionicons name="image" size={28} color="#999" />
                        </View>
                    )}
                </View>

                {/* CARD BRANCO (tudo aqui dentro) */}
                <View
                    style={{
                        marginTop: 12,
                        backgroundColor: "#fff",
                        borderRadius: 18,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.06)",
                        shadowOpacity: 0.10,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 6 },
                        elevation: 3,
                    }}
                >
                    <Text style={{ fontSize: 20, fontWeight: "900", color: "#111" }}>{data.nome}</Text>

                    <Text style={{ marginTop: 8, fontSize: 18, fontWeight: "900", color: "#0B3B91" }}>
                        {formatMoneyBR(data.preco)}
                    </Text>

                    <Text style={{ marginTop: 8, color: "#111", fontWeight: "800" }}>
                        Estoque: {data.quantidade ?? 0}
                    </Text>

                    <Text style={{ marginTop: 12, color: "#222", fontWeight: "700", lineHeight: 20 }}>
                        {data.descricao?.trim() || "Sem descrição."}
                    </Text>

                    <Pressable
                        disabled={posting || semEstoque}
                        onPress={addCarrinho}
                        style={{
                            marginTop: 16,
                            backgroundColor: semEstoque ? "rgba(0,0,0,0.08)" : "#0B3B91",
                            borderRadius: 999,
                            paddingVertical: 12,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Text style={{ color: semEstoque ? "#333" : "#fff", fontWeight: "900" }}>
                            Adicionar ao carrinho
                        </Text>
                    </Pressable>

                    <Pressable
                        disabled={posting || semEstoque}
                        onPress={comprarAgora}
                        style={{
                            marginTop: 10,
                            backgroundColor: semEstoque ? "rgba(0,0,0,0.08)" : "#1C66FF",
                            borderRadius: 999,
                            paddingVertical: 12,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {posting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={{ color: semEstoque ? "#333" : "#fff", fontWeight: "900" }}>
                                Comprar agora
                            </Text>
                        )}
                    </Pressable>
                </View>
            </View>

        </LinearGradient>
    );
}
