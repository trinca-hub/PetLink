import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
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

  const handleSave = async () => {
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

  const handleLogout = async () => {
  await logout();

  Alert.alert("Até logo!", "Você saiu da sua conta.", [
    {
      text: "OK",
      onPress: () => router.push("/login"),
    },
  ]);
};

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <Text style={styles.title}>Perfil</Text>

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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Salvar alterações</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logout}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  form: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    color: "#555",
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  disabled: {
    backgroundColor: "#f3f3f3",
    color: "#999",
  },
  saveButton: {
    marginTop: 30,
    height: 48,
    backgroundColor: "#1E90FF",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  logout: {
    marginTop: 20,
    textAlign: "center",
    color: "#E53935",
    fontSize: 14,
  },
});
