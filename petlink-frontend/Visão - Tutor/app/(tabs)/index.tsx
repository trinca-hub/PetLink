import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { AuthContext } from "@/src/context/AuthContext";
import { api } from "@/src/api/api";
import { useSideMenu } from "@/src/context/SideMenuContext";
import { TutorPalette } from "@/constants/theme";

type Pet = {
  id: number;
  nome?: string;
  raca?: string;
  idade?: string;
  foto?: string;
  fotoPet?: string;
  tipoPet?: number;
  anuncioId?: number;
};

function formatIdade(idade?: string) {
  return idade?.trim() ? idade : "Idade não informada";
}

export default function Home() {
  const { token } = useContext(AuthContext);
  const router = useRouter();
  const { openMenu } = useSideMenu();

  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPets = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = await AsyncStorage.getItem("usuario");
      const storedToken = await AsyncStorage.getItem("token");

      const finalToken = storedToken || token;

      if (!userData || !finalToken) {
        setPets([]);
        setError("Usuário ou token não encontrados.");
        return;
      }

      const user = JSON.parse(userData);
      const result: any = await api(`Pet/usuario/${user.id}`, "GET", null, finalToken);

      if (result?.data?.data && Array.isArray(result.data.data)) {
        setPets(result.data.data);
      } else {
        setPets([]);
      }
    } catch (e) {
      console.error("❌ Erro ao carregar pets:", e);
      setPets([]);
      setError("Erro ao carregar seus pets.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPets();
    }, [token])
  );

  const headerTitle = useMemo(() => "PetLink", []);
  const pageTitle = useMemo(() => "Meus Pets", []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: TutorPalette.background }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.75)", fontWeight: "800" }}>
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={[TutorPalette.background, TutorPalette.backgroundSecondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingTop: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={openMenu} style={{ width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)" }}>
            <Feather name="menu" size={22} color="#fff" />
          </Pressable>

          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>{headerTitle}</Text>

          <Pressable onPress={() => router.push("/perfil")} style={{ width: 42, height: 42, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="person" size={20} color="#fff" />
          </Pressable>
        </View>

        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900", marginTop: 12, paddingHorizontal: 16 }}>
          {pageTitle}
        </Text>

        {!!error && (
          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <Text style={{ color: TutorPalette.danger, fontWeight: "900" }}>{error}</Text>
          </View>
        )}

        <FlatList
          data={pets}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 24 }}
          refreshing={false}
          onRefresh={loadPets}
          ListEmptyComponent={() => (
            <View style={{ paddingTop: 20 }}>
              <Text style={{ color: TutorPalette.text, fontWeight: "900" }}>Nenhum pet cadastrado</Text>
              <Text style={{ color: TutorPalette.muted, marginTop: 6 }}>
                Cadastre um pet para aparecer aqui.
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const imageUri = item.foto || item.fotoPet || "https://place-puppy.com/200x200";

            return (
              <View style={{ backgroundColor: "rgba(245,247,255,0.96)", borderRadius: 22, paddingVertical: 16, paddingHorizontal: 16, marginBottom: 14, flexDirection: "row", alignItems: "center", shadowColor: TutorPalette.shadow, shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 4 }}>
                <View style={{ width: 142, height: 142, borderRadius: 18, overflow: "hidden", backgroundColor: "#E8EEFA" }}>
                  <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                </View>

                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={{ fontSize: 18, fontWeight: "900", color: TutorPalette.background, textAlign: "center" }}>
                    {item.nome || "Sem nome"}
                  </Text>

                  <View style={{ marginTop: 10, gap: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <MaterialCommunityIcons name={String(item.tipoPet).toUpperCase() === "1" ? "cat" : "dog"} size={18} color={TutorPalette.primary} />
                      <Text style={{ color: TutorPalette.surface, fontWeight: "700" }}>{item.raca || "R.N.D"}</Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Ionicons name="calendar" size={18} color={TutorPalette.secondary} />
                      <Text style={{ color: TutorPalette.surface, fontWeight: "700" }}>{formatIdade(item.idade)}</Text>
                    </View>
                  </View>

                  <Pressable onPress={() => item.anuncioId && router.push(`/anuncios/${item.anuncioId}`)} style={{ alignSelf: "center", marginTop: 12, backgroundColor: TutorPalette.primary, paddingVertical: 10, paddingHorizontal: 28, borderRadius: 999, alignItems: "center", justifyContent: "center", minWidth: 160 }}>
                    <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14, textAlign: "center", includeFontPadding: false }}>
                      Editar Foto
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
