import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "@/src/context/AuthContext";
import { updateUserService } from "@/src/api/authService";
import { router } from "expo-router";

export default function Perfil() {
  const { user, token, logout } = useContext(AuthContext);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    telefone: "",
    cep: "",
    uf: "",
    cidade: "",
    bairro: "",
    rua: "",
    numero: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome || "",
        email: user.email || "",
        telefone: user.telefone || "",
        cep: user.cep || "",
        uf: user.uf || "",
        cidade: user.cidade || "",
        bairro: user.bairro || "",
        rua: user.rua || "",
        numero: user.numero?.toString() || "",
      });
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setForm((prevForm) => ({ ...prevForm, [field]: value }));
  };

  const performSave = async () => {
    try {
      if (!user || !token) return;

      const updatedUser = {
        ...user,
        ...form,
        numero: parseInt(form.numero),
      };

      // Remover o campo senha se existir
      delete updatedUser.senha;

      await updateUserService(user.id, updatedUser, token);

      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível atualizar os dados.");
    }
  };

  const handleSave = () => {
    Alert.alert("Confirmar alterações", "Deseja salvar as alterações no seu perfil?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salvar", onPress: performSave },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.push("/login");
        },
      },
    ]);
  };

  return (
    <LinearGradient
      colors={["#0B0B0F", "#0E2B5A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.page}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <Text style={styles.headerTitle}>Perfil</Text>
            <View style={styles.headerAvatar}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.form}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={form.nome}
                onChangeText={(v) => handleChange("nome", v)}
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.disabled]}
                value={form.email}
                editable={false}
              />

              <Text style={styles.label}>Telefone</Text>
              <TextInput
                style={styles.input}
                value={form.telefone}
                onChangeText={(v) => handleChange("telefone", v)}
              />

              <Text style={styles.label}>CEP</Text>
              <TextInput
                style={styles.input}
                value={form.cep}
                onChangeText={(v) => handleChange("cep", v)}
              />

              <Text style={styles.label}>UF</Text>
              <TextInput
                style={styles.input}
                value={form.uf}
                onChangeText={(v) => handleChange("uf", v)}
              />

              <Text style={styles.label}>Cidade</Text>
              <TextInput
                style={styles.input}
                value={form.cidade}
                onChangeText={(v) => handleChange("cidade", v)}
              />

              <Text style={styles.label}>Bairro</Text>
              <TextInput
                style={styles.input}
                value={form.bairro}
                onChangeText={(v) => handleChange("bairro", v)}
              />

              <Text style={styles.label}>Rua</Text>
              <TextInput
                style={styles.input}
                value={form.rua}
                onChangeText={(v) => handleChange("rua", v)}
              />

              <Text style={styles.label}>Número</Text>
              <TextInput
                style={styles.input}
                value={form.numero}
                onChangeText={(v) => handleChange("numero", v)}
                keyboardType="numeric"
              />
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>Salvar alterações</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    paddingTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 20,
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "700",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    color: "#111",
    fontWeight: "600",
  },
  disabled: {
    backgroundColor: "#F3F4F6",
    color: "#9CA3AF",
  },
  primaryButton: {
    marginTop: 22,
    height: 48,
    backgroundColor: "#0B3B91",
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "900",
  },
  logoutButton: {
    marginTop: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  logoutText: {
    color: "#E53935",
    fontSize: 14,
    fontWeight: "700",
  },
});
