import { useState, useContext, useEffect } from "react";
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
import { AuthContext } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { TutorPalette } from "@/constants/theme";

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
      } else {
        if (result?.lockedUntil) setBloqueadoAte(result.lockedUntil);
        const tentativas = typeof result?.attemptsRemaining === "number" ? ` Tentativas restantes: ${result.attemptsRemaining}.` : "";
        setFeedback(`${result?.message || "Credenciais inválidas."}${tentativas}`);
        alert(result?.message || "Credenciais inválidas");
      }
    } catch (error) {
      console.error("Erro inesperado no login:", error);
      alert("Erro inesperado ao tentar logar.");
    }
  }

  return (
    <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ width: "100%" }}
      >
        <LinearGradient
          colors={["rgba(7, 21, 43, 0.82)", "rgba(15, 33, 60, 0.92)", "rgba(47, 124, 246, 0.92)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.badge}>
            <Ionicons name="paw" size={18} color={TutorPalette.accent} />
          </View>
          <Text style={styles.title}>Bem-vindo ao PetLink</Text>
          <Text style={styles.subtitle}>Acesse sua conta e continue com sua rotina pet.</Text>

          <Ionicons name="person-circle-outline" size={86} color="#fff" style={{ marginBottom: 20 }} />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#9EB1C8"
              style={styles.input}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.passwordInput}>
              <TextInput value={senha} onChangeText={setSenha} secureTextEntry={!mostrarSenha} placeholder="Digite sua senha" placeholderTextColor="#9EB1C8" style={styles.passwordTextInput} />
              <TouchableOpacity accessibilityRole="button" accessibilityLabel={mostrarSenha ? "Ocultar senha" : "Mostrar senha"} onPress={() => setMostrarSenha((value) => !value)} style={styles.eyeButton}>
                <Ionicons name={mostrarSenha ? "eye-off-outline" : "eye-outline"} size={21} color="#31506F" />
              </TouchableOpacity>
            </View>
          </View>

          {!!feedback && <Text accessibilityLiveRegion="polite" style={styles.feedback}>{segundosRestantes > 0 ? `${feedback} Aguarde ${segundosRestantes}s.` : feedback}</Text>}

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Redefinir senha"
            style={styles.forgotPasswordButton}
            onPress={() => router.push("/redefinir-senha")}
          >
            <Text style={styles.forgotPasswordText}>Esqueceu sua senha?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, segundosRestantes > 0 && styles.buttonDisabled]} onPress={handleLogin} disabled={segundosRestantes > 0}>
            <Text style={styles.buttonText}>{segundosRestantes > 0 ? `Aguarde ${segundosRestantes}s` : "Entrar"}</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Não tem conta?{" "}
            <Text style={styles.link} onPress={() => router.push("/register")}>
              Cadastre-se
            </Text>
          </Text>
        </LinearGradient>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "800",
    marginBottom: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
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
  passwordInput: { backgroundColor: "rgba(245,247,255,0.95)", borderRadius: 16, height: 46, flexDirection: "row", alignItems: "center" },
  passwordTextInput: { flex: 1, height: "100%", paddingLeft: 14, color: TutorPalette.background },
  eyeButton: { minWidth: 48, height: "100%", alignItems: "center", justifyContent: "center" },
  feedback: { width: "100%", color: "#FFE2A4", fontSize: 12, lineHeight: 17, marginTop: -3, marginBottom: 7, textAlign: "center" },
  button: {
    width: "100%",
    backgroundColor: TutorPalette.primary,
    borderRadius: 16,
    paddingVertical: 13,
    marginTop: 10,
    shadowColor: TutorPalette.shadow,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  buttonDisabled: { opacity: 0.62 },
  forgotPasswordButton: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 2,
  },
  forgotPasswordText: {
    color: "#DDEBFF",
    fontSize: 13,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
  },
  footerText: {
    color: "#fff",
    marginTop: 14,
    fontSize: 13,
  },
  link: {
    color: "#DDEBFF",
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
