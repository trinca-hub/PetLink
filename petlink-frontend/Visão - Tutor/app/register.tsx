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
  ActivityIndicator,
} from "react-native";
import { registerService } from "../src/api/authService";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { TutorPalette } from "@/constants/theme";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { isPasswordAccepted } from "../src/utils/passwordStrength";

export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
  });
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function handleChange(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRegister() {
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      alert("Preencha nome, email e senha.");
      return;
    }
    if (!isPasswordAccepted(form.senha)) {
      alert("Crie uma senha de pelo menos 8 caracteres com 3 tipos: maiúscula, minúscula, número ou símbolo.");
      return;
    }

    setLoading(true);
    const payload = {
      nome: form.nome.trim(),
      telefone: "",
      cep: "",
      uf: "",
      cidade: "",
      bairro: "",
      rua: "",
      numero: 0,
      email: form.email.trim().toLowerCase(),
      senha: form.senha,
    };

    const result = await registerService(payload);
    setLoading(false);

    if (result.ok) {
      alert("Conta criada!");
      router.replace("/login");
    } else {
      alert(result?.data?.message || "Erro ao cadastrar.");
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
          colors={["rgba(7, 21, 43, 0.86)", "rgba(15, 33, 60, 0.94)", "rgba(47, 124, 246, 0.9)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <KeyboardAwareScrollView
            extraScrollHeight={160}
            keyboardOpeningTime={0}
            enableOnAndroid
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <View style={styles.badge}>
                <Ionicons name="person-add-outline" size={20} color={TutorPalette.accent} />
              </View>
              <Text style={styles.title}>Criar conta</Text>
              <Text style={styles.subtitle}>
                Comece com seus dados de acesso. O endereço de entrega será escolhido na compra.
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>NOME</Text>
              <TextInput
                value={form.nome}
                onChangeText={(v) => handleChange("nome", v)}
                style={styles.input}
                placeholder="Digite seu nome"
                placeholderTextColor="#9EB1C8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL</Text>
              <TextInput
                value={form.email}
                onChangeText={(v) => handleChange("email", v)}
                style={styles.input}
                placeholder="Digite seu email"
                placeholderTextColor="#9EB1C8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SENHA</Text>
              <View style={styles.passwordInput}>
                <TextInput
                  value={form.senha}
                  onChangeText={(v) => handleChange("senha", v)}
                  style={styles.passwordTextInput}
                  placeholder="Crie uma senha"
                  placeholderTextColor="#9EB1C8"
                  secureTextEntry={!mostrarSenha}
                  autoComplete="new-password"
                />
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={mostrarSenha ? "Ocultar senha" : "Mostrar senha"} onPress={() => setMostrarSenha((value) => !value)} style={styles.eyeButton}>
                  <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={21} color="#31506F" />
                </TouchableOpacity>
              </View>
              <PasswordStrengthIndicator password={form.senha} />
            </View>

            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Cadastrar</Text>}
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
    marginVertical: 56,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "800",
    marginBottom: 6,
  },
  subtitle: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 14,
  },
  label: {
    color: "#fff",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "700",
  },
  input: {
    backgroundColor: "rgba(245,247,255,0.96)",
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 48,
    color: TutorPalette.background,
  },
  passwordInput: {
    backgroundColor: "rgba(245,247,255,0.96)",
    borderRadius: 16,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
  },
  passwordTextInput: { flex: 1, height: "100%", paddingLeft: 14, color: TutorPalette.background },
  eyeButton: { minWidth: 48, height: "100%", alignItems: "center", justifyContent: "center" },
  button: {
    width: "100%",
    minHeight: 48,
    backgroundColor: TutorPalette.primary,
    borderRadius: 16,
    paddingVertical: 13,
    marginTop: 10,
    shadowColor: TutorPalette.shadow,
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    alignItems: "center",
    justifyContent: "center",
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
