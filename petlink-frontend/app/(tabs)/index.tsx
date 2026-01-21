<<<<<<< HEAD
import React, { useContext, useEffect, useState } from "react";
=======
import React, { useEffect, useState, useContext } from "react";
>>>>>>> b6aa95b71cc22555ce2741ae2f58d1ab25962415
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
<<<<<<< HEAD
import { AuthContext } from "@/src/context/AuthContext";
import { getMyPetsService } from "@/src/api/authService";
=======
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
>>>>>>> b6aa95b71cc22555ce2741ae2f58d1ab25962415

export default function Home() {
  const { token } = useContext(AuthContext); // 🔐 Pega token do contexto
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const { logout } = useContext(AuthContext);
  const router = useRouter();

  const loadPets = async () => {
    try {
<<<<<<< HEAD
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
=======
      const userData = await AsyncStorage.getItem("usuario");
      if (!userData) return setLoading(false);

      const user = JSON.parse(userData);

      const response = await fetch(
        `http://192.168.18.74:5078/api/v1/Pet/usuario/${user.id}`
      );

      const json = await response.json();
      if (json.data && Array.isArray(json.data)) setPets(json.data);
      else setPets([]);
>>>>>>> b6aa95b71cc22555ce2741ae2f58d1ab25962415
    } catch (e) {
      console.log("❌ Erro:", e);
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
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
<<<<<<< HEAD
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
=======
    <LinearGradient
      colors={["#0B0F1A", "#003B82"]}
      style={styles.gradient}
    >
      <ScrollView style={styles.container}>

        {/* HEADER */}
        <View style={styles.header}>
          <Ionicons name="menu" size={32} color="white" />
          <Text style={styles.logo}>PetLink</Text>
          <Ionicons name="person-circle-outline" size={38} color="white" />
        </View>

        {/* TÍTULO */}
        <Text style={styles.title}>Meus Pets</Text>

        {/* LISTA */}
        {pets.map((pet) => (
          <View key={pet.id} style={styles.card}>
            <Image
              source={{
                uri: pet.imagemUrl
                  ? pet.imagemUrl
                  : "https://cdn-icons-png.flaticon.com/512/2171/2171990.png",
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
    </LinearGradient>
>>>>>>> b6aa95b71cc22555ce2741ae2f58d1ab25962415
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  container: {
    paddingHorizontal: 20,
    marginTop: 10,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0B0F1A",
  },

  /* --- HEADER --- */
  header: {
    marginTop: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
  },

  /* --- TÍTULO --- */
  title: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 25,
    marginBottom: 20,
    textDecorationLine: "underline",
  },

  /* --- CARD PET --- */
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    flexDirection: "row",
<<<<<<< HEAD
    padding: 10,
    marginBottom: 20,
    elevation: 3,
=======
    padding: 15,
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
>>>>>>> b6aa95b71cc22555ce2741ae2f58d1ab25962415
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
    fontSize: 15,
  },
});