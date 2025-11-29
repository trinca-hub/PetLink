import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";

export default function Home() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPets = async () => {
    try {
      const response = await fetch("http://192.168.12.61:5078/api/v1/Pet");

      const json = await response.json();

      console.log("🐶 Pets recebidos:", json);

      if (json.data && Array.isArray(json.data)) {
        setPets(json.data);
      } else {
        console.log("❌ Formato inesperado:", json);
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
  }, []);

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

          {/* FOTO — usa imagem padrão, já que sua API não tem foto */}
          <Image
            source={{ uri: "data:image/jpeg;base64,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" }}
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
    padding: 15,
    marginBottom: 20,
    elevation: 3,
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
