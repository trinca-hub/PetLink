import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { getFavoriteProductIds, toggleFavoriteProduct } from "@/src/storage/favoritesProducts";
import { TutorPalette } from "@/constants/theme";

type ProdutoDTO = {
  id: number;
  nome: string;
  preco: number;
  foto?: string;
};

function formatMoneyBR(valor?: number) {
  if (valor == null || Number.isNaN(valor)) return "";
  const s = Number(valor).toFixed(2).replace(".", ",");
  return `R$ ${s}`;
}

export default function Favoritos() {
  const { token, user } = useContext(AuthContext);
  const { openMenu } = useSideMenu();

  const [loading, setLoading] = useState(true);
  const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
  const [favIds, setFavIds] = useState<number[]>([]);

  async function load() {
    setLoading(true);

    const res: any = await getProdutos(token || undefined);
    const list = Array.isArray(res?.data?.data) ? res.data.data : [];
    setProdutos(list);

    if (user?.id) {
      const fav = await getFavoriteProductIds(user.id);
      setFavIds(fav);
    }

    setLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [user?.id, token])
  );

  async function onToggleFav(produtoId: number) {
    if (!user?.id) return;
    const next = await toggleFavoriteProduct(user.id, produtoId);
    setFavIds(next);
  }

  const favorites = useMemo(() => {
    return produtos.filter((p) => favIds.includes(p.id));
  }, [produtos, favIds]);

  return (
    <LinearGradient colors={[TutorPalette.background, TutorPalette.backgroundSecondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingTop: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={openMenu} style={{ width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)" }}>
            <Feather name="menu" size={22} color="#fff" />
          </Pressable>

          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>PetLink</Text>

          <Pressable onPress={() => router.push("/perfil")} style={{ width: 42, height: 42, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="person" size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <View style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: TutorPalette.border }}>
            <Text style={{ color: TutorPalette.text, fontSize: 18, fontWeight: "900" }}>Favoritos</Text>
            <Text style={{ color: TutorPalette.muted, fontSize: 13, marginTop: 4 }}>Seus produtos salvos, agora com uma experiência mais elegante.</Text>
          </View>
        </View>

        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 14 }}>
          {loading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.75)", fontWeight: "800" }}>Carregando...</Text>
            </View>
          ) : favorites.length === 0 ? (
            <View style={{ paddingTop: 16 }}>
              <Text style={{ color: TutorPalette.text, fontWeight: "900" }}>Nenhum favorito por aqui.</Text>
              <Text style={{ color: TutorPalette.muted, marginTop: 6 }}>Marque produtos com o coração para salvar.</Text>
            </View>
          ) : (
            <FlatList
              data={favorites}
              numColumns={2}
              keyExtractor={(item) => String(item.id)}
              columnWrapperStyle={{ gap: 12 }}
              contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
              renderItem={({ item }) => (
                <Pressable onPress={() => router.push(`/produtos/${item.id}`)} style={{ flex: 1, backgroundColor: "rgba(245,247,255,0.96)", borderRadius: 18, padding: 12, shadowColor: TutorPalette.shadow, shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 4 }}>
                  <View style={{ width: "100%", height: 120, borderRadius: 14, overflow: "hidden", backgroundColor: "#F2F2F7" }}>
                    {!!item.foto ? (
                      <Image source={{ uri: item.foto }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                    ) : (
                      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Ionicons name="image" size={20} color="#999" />
                      </View>
                    )}

                    <Pressable onPress={() => onToggleFav(item.id)} style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" }}>
                      <Ionicons name="heart" size={14} color="#E53935" />
                    </Pressable>
                  </View>

                  <Text numberOfLines={2} style={{ marginTop: 10, fontWeight: "900", color: TutorPalette.background }}>
                    {item.nome}
                  </Text>

                  <View style={{ marginTop: 8, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "900", color: TutorPalette.primary }}>{formatMoneyBR(item.preco)}</Text>

                    <Pressable onPress={() => router.push(`/produtos/${item.id}`)} style={{ backgroundColor: TutorPalette.primary, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 10 }}>
                      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>Ver</Text>
                    </Pressable>
                  </View>
                </Pressable>
              )}
            />
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}
