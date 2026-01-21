import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "@/src/context/AuthContext";
import { getMyPetsService } from "@/src/api/authService";

export default function Home() {
  const { token } = useContext(AuthContext); // 🔐 Pega token do contexto
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPets = async () => {
    try {
      if (!token) {
        console.warn("⚠️ Sem token, não é possível buscar os pets.");
        return;
      }

      console.log("🔐 TOKEN USADO:", token); // debug
      const result = await getMyPetsService(token);

      console.log("🐶 Pets recebidos:", result);

      if (result?.data?.code === 1 && Array.isArray(result.data.data)) {
        setPets(result.data.data);
      } else {
        console.warn("⚠️ Formato inesperado:", result);
        setPets([]);
      }
    } catch (e) {
      console.log("❌ Erro ao carregar pets:", e);
      setPets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
  }, [token]); // Executa quando o token estiver disponível

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Meus Pets</Text>

      {pets.map((pet) => (
        <View key={pet.id} style={styles.card}>
          <Image
  source={{
    uri: pet.foto || "https://place-puppy.com/110x110", // se não tiver foto, usa placeholder
  }}
  style={styles.petImage}
/>


          <View style={styles.info}>
            <Text style={styles.petName}>{pet.nome}</Text>
            <Text style={styles.petDetail}>🐾 {pet.raca}</Text>
            <Text style={styles.petDetail}>📅 {pet.idade} meses</Text>

            <TouchableOpacity style={styles.btn}>
              <Text style={styles.btnText}>Editar Foto</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#0C1B33",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "white",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    textDecorationLine: "underline",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    flexDirection: "row",
    padding: 10,
    marginBottom: 20,
    elevation: 3,
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 15,
  },
  info: {
    flex: 1,
    paddingLeft: 15,
    justifyContent: "space-between",
  },
  petName: {
    fontSize: 22,
    fontWeight: "bold",
  },
  petDetail: {
    fontSize: 15,
    color: "#555",
  },
  btn: {
    backgroundColor: "#0066CC",
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 6,
  },
  btnText: {
    color: "white",
    fontWeight: "bold",
  },
});
