import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { api } from "@/src/api/api";

export default function Home() {
  const { token } = useContext(AuthContext);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const loadPets = async () => {
    try {
      setLoading(true);

      const userData = await AsyncStorage.getItem("usuario");
      const token = await AsyncStorage.getItem("token");

      if (!userData || !token) {
        console.warn("⚠️ Usuário ou token não encontrados");
        return setLoading(false);
      }

      const user = JSON.parse(userData);
      const result = await api(`Pet/usuario/${user.id}`, "GET", null, token);

      if (result?.data?.data && Array.isArray(result.data.data)) {
        setPets(result.data.data);
      } else {
        setPets([]);
      }
    } catch (e) {
      console.error("❌ Erro ao carregar pets:", e);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.background}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Meus Pets</Text>

        {pets.map((pet) => (
          <View key={pet.id} style={styles.card}>
            <Image
              source={{
                uri: pet.foto || "https://place-puppy.com/120x120",
              }}
              style={styles.petImage}
            />

            <View style={styles.info}>
              <Text style={styles.petName}>{pet.nome}</Text>
              <Text style={styles.petDetail}>🐾 {pet.raca}</Text>
              <Text style={styles.petDetail}>
                📅 {pet.idade > 11 ? `${Math.floor(pet.idade / 12)} anos` : `${pet.idade} meses`}
              </Text>

              <TouchableOpacity
                style={styles.btn}
                onPress={() => router.push(`/editar-foto/${pet.id}`)}
              >
                <Text style={styles.btnText}>Editar Foto</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#0B0F1A", // Azul escuro para simular o degradê
  },
  container: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B0F1A",
  },
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 25,
    marginBottom: 20,
    textDecorationLine: "underline",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    flexDirection: "row",
    padding: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  petImage: {
    width: 110,
    height: 110,
    borderRadius: 15,
  },
  info: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: "space-between",
  },
  petName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  petDetail: {
    fontSize: 15,
    color: "#444",
  },
  btn: {
    backgroundColor: "#0066CC",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
});
