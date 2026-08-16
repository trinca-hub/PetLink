import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { registerService } from "../src/api/authService";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { PetLinkAuthBackdrop, PetLinkAuthHeader } from "@/components/PetLinkAuthVisual";
import { isPasswordAccepted } from "../src/utils/passwordStrength";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function handleChange(key: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRegister() {
    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      alert("Preencha nome, e-mail e senha.");
      return;
    }

    if (!isPasswordAccepted(form.senha)) {
      alert("Crie uma senha de pelo menos 8 caracteres com 3 tipos: maiúscula, minúscula, número ou símbolo.");
      return;
    }

    setLoading(true);

    try {
      const result = await registerService({
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
      });

      if (result.ok) {
        alert("Conta criada!");
        router.replace("/login");
      } else {
        alert(result?.data?.message || "Erro ao cadastrar.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={["#030508", "#090C12", "#020305"]} style={styles.page}>
      <PetLinkAuthBackdrop />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
          <KeyboardAwareScrollView
            contentContainerStyle={styles.content}
            extraScrollHeight={110}
            keyboardOpeningTime={0}
            enableOnAndroid
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.form}>
              <PetLinkAuthHeader title="Criar conta" subtitle="Seu cuidado começa por aqui." />

              <View style={styles.field}>
                <Ionicons name="person-outline" size={23} color="#287AF5" />
                <TextInput
                  value={form.nome}
                  onChangeText={(value) => handleChange("nome", value)}
                  style={styles.input}
                  placeholder="Nome"
                  placeholderTextColor="#8B909A"
                  autoComplete="name"
                />
              </View>

              <View style={styles.field}>
                <Ionicons name="mail-outline" size={23} color="#287AF5" />
                <TextInput
                  value={form.email}
                  onChangeText={(value) => handleChange("email", value)}
                  style={styles.input}
                  placeholder="E-mail"
                  placeholderTextColor="#8B909A"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>

              <View style={[styles.field, styles.passwordField]}>
                <Ionicons name="lock-closed-outline" size={23} color="#287AF5" />
                <TextInput
                  value={form.senha}
                  onChangeText={(value) => handleChange("senha", value)}
                  style={styles.input}
                  placeholder="Crie uma senha"
                  placeholderTextColor="#8B909A"
                  secureTextEntry={!mostrarSenha}
                  autoComplete="new-password"
                />
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                  onPress={() => setMostrarSenha((value) => !value)}
                  style={styles.eyeButton}
                >
                  <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={24} color="#9AA0AA" />
                </TouchableOpacity>
              </View>

              <PasswordStrengthIndicator password={form.senha} />

              <TouchableOpacity accessibilityRole="button" style={[styles.primaryButton, loading && styles.buttonDisabled]} onPress={handleRegister} disabled={loading}>
                <LinearGradient colors={["#1764D9", "#0E51C7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGradient}>
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Criar conta</Text>}
                  {!loading && <Ionicons name="paw" size={29} color="rgba(255,255,255,0.28)" style={styles.buttonPaw} />}
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.loginPrompt}>
                <Text style={styles.loginPromptText}>Já tem uma conta?</Text>
                <TouchableOpacity accessibilityRole="button" onPress={() => router.push("/login")}>
                  <Text style={styles.loginLink}>Entrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAwareScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  safeArea: { flex: 1 },
  keyboard: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 26, paddingVertical: 28 },
  form: { width: "100%", maxWidth: 430, alignSelf: "center" },
  field: {
    height: 54,
    marginBottom: 12,
    paddingLeft: 17,
    paddingRight: 8,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.23)",
    backgroundColor: "rgba(255,255,255,0.055)",
    flexDirection: "row",
    alignItems: "center",
  },
  passwordField: { marginBottom: 0 },
  input: { flex: 1, height: 54, marginLeft: 13, color: "#F6F8FC", fontSize: 16 },
  eyeButton: { width: 46, height: 54, justifyContent: "center", alignItems: "center" },
  primaryButton: { width: "100%", height: 64, marginTop: 26, borderRadius: 17, overflow: "hidden", shadowColor: "#0B5DDB", shadowOpacity: 0.38, shadowRadius: 13, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  primaryGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  primaryButtonText: { color: "#fff", fontSize: 22, fontWeight: "800" },
  buttonPaw: { position: "absolute", right: 24 },
  buttonDisabled: { opacity: 0.58 },
  loginPrompt: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 7, marginTop: 22 },
  loginPromptText: { color: "rgba(255,255,255,0.72)", fontSize: 15 },
  loginLink: { color: "#287AF5", fontSize: 15, fontWeight: "800" },
});
