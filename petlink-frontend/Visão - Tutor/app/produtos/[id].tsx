import React, { useContext, useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Image, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";

import { AuthContext } from "@/src/context/AuthContext";
import { getProdutoById } from "@/src/api/produtoService";
import { addToCartProducts } from "@/src/storage/cartProducts";
import { TutorPalette } from "@/constants/theme";

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
    const [data, setData] = useState<ProdutoDTO | null>(null);
    const [buyQty, setBuyQty] = useState(1);

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

    useEffect(() => {
        const estoque = Number(data?.quantidade ?? 0);
        if (estoque <= 0) {
            setBuyQty(1);
            return;
        }
        setBuyQty((prev) => Math.min(Math.max(1, prev), estoque));
    }, [data?.quantidade]);

    const semEstoque = (data?.quantidade ?? 0) <= 0;

    async function addCarrinho() {
        if (!user?.id || !data) return;
        if (semEstoque) return Alert.alert("Sem estoque", "Esse produto está esgotado.");

        const quantidade = Math.min(Math.max(1, buyQty), Number(data.quantidade ?? 0));

        await addToCartProducts(
            user.id,
            {
                produtoId: data.id,
                nome: data.nome,
                preco: data.preco,
                foto: data.foto,
                estoque: data.quantidade,
            },
            quantidade
        );

        Alert.alert("Pronto!", "Adicionado ao carrinho.");
    }

    function decBuyQty() {
        setBuyQty((prev) => Math.max(1, prev - 1));
    }

    function incBuyQty() {
        const estoque = Number(data?.quantidade ?? 0);
        if (estoque <= 0) return;
        setBuyQty((prev) => Math.min(estoque, prev + 1));
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
        <LinearGradient colors={[TutorPalette.background, TutorPalette.backgroundSecondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
            {/* Header */}
            <View style={{ paddingTop: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Pressable onPress={() => router.back()} style={{ width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)" }}>
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
                        backgroundColor: "rgba(245,247,255,0.96)",
                        borderRadius: 18,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: "rgba(0,0,0,0.06)",
                        shadowColor: TutorPalette.shadow,
                        shadowOpacity: 0.16,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 8 },
                        elevation: 3,
                    }}
                >
                    <Text style={{ fontSize: 20, fontWeight: "900", color: "#111" }}>{data.nome}</Text>

                    <Text style={{ marginTop: 8, fontSize: 18, fontWeight: "900", color: TutorPalette.primary }}>
                        {formatMoneyBR(data.preco)}
                    </Text>

                    <Text style={{ marginTop: 8, color: "#111", fontWeight: "800" }}>
                        Estoque: {data.quantidade ?? 0}
                    </Text>

                    <Text style={{ marginTop: 12, color: "#222", fontWeight: "700", lineHeight: 20 }}>
                        {data.descricao?.trim() || "Sem descrição."}
                    </Text>

                    <View style={{ marginTop: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <Text style={{ color: "#111", fontWeight: "900" }}>Quantidade</Text>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Pressable
                                onPress={decBuyQty}
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    backgroundColor: "rgba(0,0,0,0.06)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Ionicons name="remove" size={18} color={TutorPalette.primary} />
                            </Pressable>

                            <Text style={{ minWidth: 22, textAlign: "center", fontWeight: "900", color: "#111" }}>
                                {buyQty}
                            </Text>

                            <Pressable
                                onPress={incBuyQty}
                                disabled={semEstoque || buyQty >= Number(data.quantidade ?? 0)}
                                style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 10,
                                    backgroundColor:
                                        semEstoque || buyQty >= Number(data.quantidade ?? 0)
                                            ? "rgba(0,0,0,0.03)"
                                            : "rgba(28,102,255,0.14)",
                                    borderWidth: 1,
                                    borderColor:
                                        semEstoque || buyQty >= Number(data.quantidade ?? 0)
                                            ? "rgba(0,0,0,0.08)"
                                            : "rgba(28,102,255,0.35)",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity: semEstoque || buyQty >= Number(data.quantidade ?? 0) ? 0.6 : 1,
                                }}
                            >
                                <Ionicons name="add" size={18} color={TutorPalette.primary} />
                            </Pressable>
                        </View>
                    </View>

                    <Pressable
                        disabled={semEstoque}
                        onPress={addCarrinho}
                        style={{
                            marginTop: 16,
                            backgroundColor: semEstoque ? "rgba(0,0,0,0.08)" : TutorPalette.primary,
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
                </View>
            </View>

        </LinearGradient>
    );
}
