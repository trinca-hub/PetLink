import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { registerService } from "../src/api/authService";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TutorPalette } from "@/constants/theme";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    cep: "",
    uf: "",
    cidade: "",
    bairro: "",
    rua: "",
    numero: "",
    email: "",
    senha: "",
  });

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRegister() {
    const payload = {
      nome: form.nome,
      telefone: form.telefone,
      cep: form.cep,
      uf: form.uf,
      cidade: form.cidade,
      bairro: form.bairro,
      rua: form.rua,
      numero: Number(form.numero),
      email: form.email,
      senha: form.senha,
    };

    const result = await registerService(payload);

    if (result.ok) {
      alert("Conta criada!");
      router.replace("/login");
    } else {
      alert("Erro ao cadastrar!");
    }
  }

  return (
    <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <LinearGradient
          colors={["rgba(7, 21, 43, 0.84)", "rgba(15, 33, 60, 0.94)", "rgba(47, 124, 246, 0.92)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <KeyboardAwareScrollView
            extraScrollHeight={220}
            keyboardOpeningTime={0}
            enableOnAndroid={true}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.badge}>
                <Ionicons name="sparkles" size={18} color={TutorPalette.accent} />
              </View>
              <Text style={styles.title}>Criar conta</Text>
              <Text style={styles.subtitle}>Personalize seu perfil e comece a usar o PetLink.</Text>
            </View>

            <Ionicons name="person-add-outline" size={84} color="#fff" style={{ alignSelf: "center", marginBottom: 18 }} />

            {Object.keys(form).map((key) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.label}>{key.toUpperCase()}</Text>
                <TextInput
                  value={form[key as keyof typeof form]}
                  onChangeText={(v) => handleChange(key, v)}
                  style={styles.input}
                  placeholder={`Digite ${key}`}
                  placeholderTextColor="#9EB1C8"
                />
              </View>
            ))}

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Já tem conta? <Text style={styles.link} onPress={() => router.push("/login")}>Entrar</Text>
            </Text>
          </KeyboardAwareScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  card: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    marginVertical: 36,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  header: {
    alignItems: "center",
    marginBottom: 10,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    textAlign: "center",
  },
  inputGroup: {
    width: "100%",
    marginBottom: 12,
  },
  label: {
    color: "#fff",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "rgba(245,247,255,0.95)",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 46,
    color: TutorPalette.background,
  },
  button: {
    width: "100%",
    backgroundColor: TutorPalette.primary,
    borderRadius: 16,
    paddingVertical: 13,
    marginTop: 12,
    shadowColor: TutorPalette.shadow,
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
  },
  footerText: {
    color: "#fff",
    marginTop: 16,
    alignSelf: "center",
    fontSize: 13,
  },
  link: {
    color: "#DDEBFF",
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
