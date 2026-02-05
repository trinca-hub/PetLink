import React, { useContext, useEffect, useMemo, useState } from "react";
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
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { AuthContext } from "@/src/context/AuthContext";
import { api } from "@/src/api/api";

type Pet = {
  id: number;
  nome?: string;
  raca?: string;
  idade?: number; // pelo seu código: meses
  foto?: string;
  fotoPet?: string;
};

function formatIdadeMeses(meses?: number) {
  if (meses == null) return "Idade não informada";
  if (meses >= 12) {
    const anos = Math.floor(meses / 12);
    const resto = meses % 12;
    if (resto === 0) return `${anos} anos`;
    return `${anos} anos e ${resto} meses`;
  }
  return `${meses} meses`;
}

export default function Home() {
  const { token } = useContext(AuthContext);
  const router = useRouter();

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

  useEffect(() => {
    loadPets();
  }, [token]);

  const headerTitle = useMemo(() => "PetLink", []);
  const pageTitle = useMemo(() => "Meus Pets", []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0B0B0F" }}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={{ marginTop: 10, color: "rgba(255,255,255,0.75)", fontWeight: "800" }}>
          Carregando...
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
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header (igual ao PeTinder) */}
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

          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>{headerTitle}</Text>

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

        {/* Title sublinhado */}
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
            {pageTitle}
          </Text>
        </View>

        {/* Erro */}
        {!!error && (
          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <Text style={{ color: "#ffb4b4", fontWeight: "900" }}>{error}</Text>
          </View>
        )}

        {/* Lista */}
        <FlatList
          data={pets}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 }}
          refreshing={false}
          onRefresh={loadPets}
          ListEmptyComponent={() => (
            <View style={{ paddingTop: 20 }}>
              <Text style={{ color: "#fff", fontWeight: "900" }}>Nenhum pet cadastrado</Text>
              <Text style={{ color: "rgba(255,255,255,0.75)", marginTop: 6 }}>
                Cadastre um pet para aparecer aqui.
              </Text>
            </View>
          )}
          renderItem={({ item }) => {
            const imageUri = item.foto || item.fotoPet || "https://place-puppy.com/200x200";

            return (
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 22,
                  paddingVertical: 16,
                  paddingHorizontal: 16,
                  marginBottom: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  shadowOpacity: 0.12,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: 4,
                }}
              >
                {/* Imagem (quadrada, bordas arredondadas) */}
                <View
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: 18,
                    overflow: "hidden",
                    backgroundColor: "#EEE",
                  }}
                >
                  <Image
                    source={{ uri: imageUri }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="cover"
                  />
                </View>

                {/* Conteúdo direito */}
                <View style={{ flex: 1, marginLeft: 14 }}>
                  {/* Nome */}
                  <Text style={{ fontSize: 18, fontWeight: "900", color: "#111", textAlign: "center" }}>
                    {item.nome || "Sem nome"}
                  </Text>

                  {/* Infos */}
                  <View style={{ marginTop: 10, gap: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <MaterialCommunityIcons name="dog" size={18} color="#0E2B5A" />
                      <Text style={{ color: "#222", fontWeight: "700" }}>
                        {item.raca || "R.N.D"}
                      </Text>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <Ionicons name="calendar" size={18} color="#0E2B5A" />
                      <Text style={{ color: "#222", fontWeight: "700" }}>
                        {formatIdadeMeses(item.idade)}
                      </Text>
                    </View>
                  </View>

                  {/* Botão igual ao figma */}
                  <Pressable
                    onPress={() => router.push(`/anuncios/${item.anuncioId}`)}
                    style={{
                      alignSelf: "center",
                      marginTop: 12,
                      backgroundColor: "#0B3B91",
                      paddingVertical: 10,
                      paddingHorizontal: 28,
                      borderRadius: 999,
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 160,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "900",
                        fontSize: 14,
                        textAlign: "center",
                        includeFontPadding: false,
                      }}
                    >
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
