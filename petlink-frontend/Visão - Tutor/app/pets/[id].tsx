import React, { useContext, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

import { api } from "@/src/api/api";
import { AuthContext } from "@/src/context/AuthContext";
import { TutorPalette } from "@/constants/theme";

type Pet = {
  id: number;
  nome?: string;
  raca?: string;
  sexo?: string;
  rga?: string;
  idade?: string;
  peso?: number;
  castrado?: boolean;
  foto?: string;
  tipoPet?: string | number;
};

function petTypeLabel(tipo?: string | number) {
  const value = String(tipo ?? "").toUpperCase();
  return value === "1" || value === "GATO" ? "Gato" : "Cachorro";
}

function sexoLabel(sexo?: string) {
  const value = String(sexo ?? "").trim().toLowerCase();
  if (value === "m" || value === "macho") return "Macho";
  if (value === "f" || value === "femea" || value === "fêmea") return "Fêmea";
  return sexo?.trim() || "Não informado";
}

export default function PetDetailsScreen() {
  const { token } = useContext(AuthContext);
  const { id } = useLocalSearchParams<{ id?: string }>();
  const petId = useMemo(() => Number(id), [id]);
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPet() {
      if (!petId || Number.isNaN(petId)) {
        setError("Pet inválido.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const result: any = await api("Pet/meus", "GET", undefined, token || undefined);

      if (!result?.ok) {
        setError(result?.data?.message || "Não foi possível carregar seus pets.");
        setLoading(false);
        return;
      }

      const pets = Array.isArray(result?.data?.data) ? result.data.data : [];
      const foundPet = pets.find((item: Pet) => Number(item.id) === petId);
      if (!foundPet) {
        setError("Pet não encontrado.");
      } else {
        setPet(foundPet);
      }
      setLoading(false);
    }

    loadPet();
  }, [petId, token]);

  if (loading) {
    return (
      <View style={styles.loadingPage}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Carregando pet...</Text>
      </View>
    );
  }

  const tipo = petTypeLabel(pet?.tipoPet);
  const imageUri = pet?.foto || "https://place-puppy.com/600x600";

  return (
    <LinearGradient colors={[TutorPalette.background, TutorPalette.backgroundSecondary]} style={styles.page}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.navButton} accessibilityLabel="Voltar">
          <Feather name="arrow-left" size={22} color="#fff" />
        </Pressable>
        <Text style={styles.headerTitle}>Meu Pet</Text>
        <Pressable onPress={() => router.push("/perfil")} style={styles.navButton} accessibilityLabel="Perfil">
          <Ionicons name="person" size={20} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {!!pet && (
          <>
            <View style={styles.imageShell}>
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
              <View style={styles.typeBadge}>
                <MaterialCommunityIcons name={tipo === "Gato" ? "cat" : "dog"} size={18} color="#fff" />
                <Text style={styles.typeBadgeText}>{tipo}</Text>
              </View>
            </View>

            <View style={styles.detailsCard}>
              <View style={styles.nameRow}>
                <View>
                  <Text style={styles.petName}>{pet.nome || "Pet"}</Text>
                  <Text style={styles.petBreed}>{pet.raca || "Raça não informada"}</Text>
                </View>
                <View style={styles.sexBadge}>
                  <Ionicons name="male-female" size={17} color={TutorPalette.primary} />
                  <Text style={styles.sexText}>{sexoLabel(pet.sexo)}</Text>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <InfoItem icon="calendar-outline" label="Idade" value={pet.idade?.trim() || "Não informada"} />
                <InfoItem icon="scale-outline" label="Peso" value={pet.peso != null ? `${Number(pet.peso).toLocaleString("pt-BR")} kg` : "Não informado"} />
                <InfoItem icon="id-card-outline" label="RGA" value={pet.rga?.trim() || "Não informado"} />
                <InfoItem icon="medkit-outline" label="Castrado" value={pet.castrado ? "Sim" : "Não"} />
              </View>

              <View style={styles.notice}>
                <Ionicons name="information-circle-outline" size={20} color={TutorPalette.primary} />
                <Text style={styles.noticeText}>Para alterar os dados deste pet, entre em contato com a equipe de gestão.</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

function InfoItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  return (
    <View style={styles.infoItem}>
      <Ionicons name={icon} size={19} color={TutorPalette.primary} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  loadingPage: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: TutorPalette.background },
  loadingText: { marginTop: 10, color: "#fff", fontWeight: "800" },
  header: { paddingTop: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  navButton: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)" },
  headerTitle: { color: "#fff", fontSize: 22, fontWeight: "900" },
  content: { padding: 16, paddingBottom: 30 },
  errorText: { color: "#ffb4b4", fontWeight: "800", marginBottom: 12 },
  imageShell: { height: 290, borderRadius: 24, overflow: "hidden", backgroundColor: "#0b1730", position: "relative" },
  image: { width: "100%", height: "100%" },
  typeBadge: { position: "absolute", right: 14, top: 14, flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 999, backgroundColor: "rgba(15,29,58,0.86)", paddingHorizontal: 12, paddingVertical: 8 },
  typeBadgeText: { color: "#fff", fontWeight: "900" },
  detailsCard: { marginTop: 14, borderRadius: 26, backgroundColor: "rgba(15,29,58,0.94)", borderWidth: 1, borderColor: "rgba(255,255,255,0.10)", padding: 16 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  petName: { color: "#fff", fontSize: 25, fontWeight: "900" },
  petBreed: { color: "#b9c9e8", marginTop: 4, fontSize: 16, fontWeight: "700" },
  sexBadge: { flexDirection: "row", alignItems: "center", gap: 7, borderRadius: 999, backgroundColor: "rgba(47,124,246,0.20)", paddingHorizontal: 11, paddingVertical: 8 },
  sexText: { color: TutorPalette.primary, fontWeight: "900" },
  infoGrid: { marginTop: 18, flexDirection: "row", flexWrap: "wrap", gap: 10 },
  infoItem: { width: "48%", minHeight: 100, borderRadius: 16, padding: 12, backgroundColor: "rgba(9,19,40,0.65)", borderWidth: 1, borderColor: "rgba(255,255,255,0.09)" },
  infoLabel: { marginTop: 7, color: "#8ea5cb", fontSize: 13, fontWeight: "700" },
  infoValue: { marginTop: 3, color: "#fff", fontSize: 15, fontWeight: "800" },
  notice: { marginTop: 18, flexDirection: "row", gap: 9, alignItems: "flex-start", borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)", paddingTop: 16 },
  noticeText: { flex: 1, color: "#dce8ff", fontSize: 14, lineHeight: 20, fontWeight: "700" },
});
