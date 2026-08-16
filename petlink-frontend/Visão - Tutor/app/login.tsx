import { useContext, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AuthContext } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PetLinkAuthBackdrop, PetLinkAuthHeader } from "@/components/PetLinkAuthVisual";

export default function Login() {
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [bloqueadoAte, setBloqueadoAte] = useState<string | null>(null);
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  useEffect(() => {
    if (!bloqueadoAte) return;

    const atualizar = () => {
      const segundos = Math.max(0, Math.ceil((new Date(bloqueadoAte).getTime() - Date.now()) / 1000));
      setSegundosRestantes(segundos);

      if (segundos === 0) {
        setBloqueadoAte(null);
        setFeedback("");
      }
    };

    atualizar();
    const timer = setInterval(atualizar, 1000);
    return () => clearInterval(timer);
  }, [bloqueadoAte]);

  async function handleLogin() {
    try {
      const result = await login(email, senha);

      if (result?.code === 1) {
        router.replace("/(tabs)");
        return;
      }

      if (result?.lockedUntil) setBloqueadoAte(result.lockedUntil);
      const tentativas = typeof result?.attemptsRemaining === "number" ? ` Tentativas restantes: ${result.attemptsRemaining}.` : "";
      setFeedback(`${result?.message || "Credenciais inválidas."}${tentativas}`);
      alert(result?.message || "Credenciais inválidas.");
    } catch (error) {
      console.error("Erro inesperado no login:", error);
      alert("Erro inesperado ao tentar entrar.");
    }
  }

  return (
    <LinearGradient colors={["#030508", "#090C12", "#020305"]} style={styles.page}>
      <PetLinkAuthBackdrop />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <PetLinkAuthHeader />

              <View style={styles.field}>
                <Ionicons name="mail-outline" size={23} color="#287AF5" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="E-mail"
                  placeholderTextColor="#8B909A"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>

              <View style={styles.field}>
                <Ionicons name="lock-closed-outline" size={23} color="#287AF5" />
                <TextInput
                  value={senha}
                  onChangeText={setSenha}
                  placeholder="Senha"
                  placeholderTextColor="#8B909A"
                  style={styles.input}
                  secureTextEntry={!mostrarSenha}
                  autoComplete="current-password"
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

              {!!feedback && (
                <Text accessibilityLiveRegion="polite" style={styles.feedback}>
                  {segundosRestantes > 0 ? `${feedback} Aguarde ${segundosRestantes}s.` : feedback}
                </Text>
              )}

              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Redefinir senha"
                style={styles.forgotPasswordButton}
                onPress={() => router.push("/redefinir-senha")}
              >
                <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.primaryButton, segundosRestantes > 0 && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={segundosRestantes > 0}
              >
                <LinearGradient colors={["#1764D9", "#0E51C7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGradient}>
                  <Text style={styles.primaryButtonText}>{segundosRestantes > 0 ? `Aguarde ${segundosRestantes}s` : "Entrar"}</Text>
                  <Ionicons name="paw" size={30} color="rgba(255,255,255,0.28)" style={styles.buttonPaw} />
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>ou</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity accessibilityRole="button" style={styles.secondaryButton} onPress={() => router.push("/register")}>
                <Ionicons name="person-add-outline" size={27} color="#287AF5" />
                <Text style={styles.secondaryButtonText}>Criar conta</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  safeArea: { flex: 1 },
  keyboard: { flex: 1 },
  content: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 26, paddingVertical: 26 },
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
  input: { flex: 1, height: 54, marginLeft: 13, color: "#F6F8FC", fontSize: 16 },
  eyeButton: { width: 46, height: 54, justifyContent: "center", alignItems: "center" },
  feedback: { color: "#FFB4BE", fontSize: 12, lineHeight: 17, textAlign: "center", marginTop: -4, marginBottom: 8 },
  forgotPasswordButton: { alignSelf: "flex-start", marginTop: 2, marginBottom: 27 },
  forgotPasswordText: { color: "#287AF5", fontSize: 16, fontWeight: "700" },
  primaryButton: { width: "100%", height: 66, borderRadius: 17, overflow: "hidden", shadowColor: "#0B5DDB", shadowOpacity: 0.38, shadowRadius: 13, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  primaryGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  primaryButtonText: { color: "#fff", fontSize: 25, fontWeight: "800" },
  buttonPaw: { position: "absolute", right: 24 },
  buttonDisabled: { opacity: 0.56 },
  divider: { flexDirection: "row", alignItems: "center", gap: 16, marginVertical: 28 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.24)" },
  dividerText: { color: "rgba(255,255,255,0.64)", fontSize: 17, fontWeight: "600" },
  secondaryButton: { height: 64, borderRadius: 17, borderWidth: 1.5, borderColor: "#287AF5", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 13, backgroundColor: "rgba(21,96,215,0.05)" },
  secondaryButtonText: { color: "#287AF5", fontSize: 22, fontWeight: "700" },
});
