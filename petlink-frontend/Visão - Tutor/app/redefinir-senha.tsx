import { useState } from "react";
import {
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { TutorPalette } from "@/constants/theme";
import { requestPasswordResetService, resetPasswordService } from "@/src/api/authService";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { isPasswordAccepted } from "../src/utils/passwordStrength";

export default function RedefinirSenha() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; token?: string }>();
  const emailDoLink = Array.isArray(params.email) ? params.email[0] : params.email;
  const tokenDoLink = Array.isArray(params.token) ? params.token[0] : params.token;
  const [email, setEmail] = useState(emailDoLink ?? "");
  const [token, setToken] = useState(tokenDoLink ?? "");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [codigoSolicitado, setCodigoSolicitado] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  async function handleSolicitacao() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      Alert.alert("E-mail inválido", "Informe o e-mail usado no seu cadastro.");
      return;
    }

    setEnviando(true);
    const result = await requestPasswordResetService(normalizedEmail);
    setEnviando(false);
    if (!result.ok) {
      Alert.alert("Não foi possível enviar", result.data?.message || "Tente novamente mais tarde.");
      return;
    }

    setCodigoSolicitado(true);
    Alert.alert("Verifique seu e-mail", "Copie o código de recuperação do e-mail e informe-o nesta tela.");
  }

  async function handleRedefinicao() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || !token.trim()) {
      Alert.alert("Dados incompletos", "Informe o e-mail e o código recebido.");
      return;
    }
    if (!isPasswordAccepted(novaSenha)) {
      Alert.alert("Senha fraca", "Use ao menos 8 caracteres e combine 3 tipos: maiúscula, minúscula, número ou símbolo.");
      return;
    }
    if (novaSenha !== confirmacaoSenha) {
      Alert.alert("Senhas diferentes", "Confirme a nova senha corretamente.");
      return;
    }

    setEnviando(true);
    const result = await resetPasswordService(normalizedEmail, token.trim(), novaSenha);
    setEnviando(false);
    if (!result.ok) {
      Alert.alert("Não foi possível redefinir", result.data?.message || "Solicite um novo link.");
      return;
    }

    Alert.alert("Senha atualizada", result.data?.message || "Faça login com sua nova senha.", [
      { text: "Ir para login", onPress: () => router.replace("/login") },
    ]);
  }

  return (
    <ImageBackground
      source={require("../assets/images/background.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <LinearGradient
            colors={["rgba(7, 21, 43, 0.82)", "rgba(15, 33, 60, 0.92)", "rgba(47, 124, 246, 0.92)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
          <View style={styles.badge}>
            <Ionicons name="lock-closed-outline" size={22} color={TutorPalette.accent} />
          </View>
          <Text style={styles.title}>Redefinir senha</Text>
          <Text style={styles.subtitle}>
            {token || codigoSolicitado
              ? "Informe o código recebido e crie uma nova senha para sua conta."
              : "Informe seu e-mail. Você receberá um link e um código seguro para criar uma nova senha."}
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail cadastrado</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#9EB1C8"
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
          </View>

          {token || codigoSolicitado ? (
            <>
              {!token && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Código de recuperação</Text>
                  <TextInput
                    value={token}
                    onChangeText={setToken}
                    placeholder="Cole o código recebido no e-mail"
                    placeholderTextColor="#9EB1C8"
                    style={styles.input}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                </View>
              )}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nova senha</Text>
                <View style={styles.passwordInput}>
                  <TextInput value={novaSenha} onChangeText={setNovaSenha} style={styles.passwordTextInput} secureTextEntry={!mostrarNovaSenha} autoComplete="new-password" />
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={mostrarNovaSenha ? "Ocultar senha" : "Mostrar senha"} onPress={() => setMostrarNovaSenha((value) => !value)} style={styles.eyeButton}>
                    <Ionicons name={mostrarNovaSenha ? "eye-off-outline" : "eye-outline"} size={21} color="#31506F" />
                  </TouchableOpacity>
                </View>
                <PasswordStrengthIndicator password={novaSenha} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirmar nova senha</Text>
                <View style={styles.passwordInput}>
                  <TextInput value={confirmacaoSenha} onChangeText={setConfirmacaoSenha} style={styles.passwordTextInput} secureTextEntry={!mostrarConfirmacao} autoComplete="new-password" />
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel={mostrarConfirmacao ? "Ocultar senha" : "Mostrar senha"} onPress={() => setMostrarConfirmacao((value) => !value)} style={styles.eyeButton}>
                    <Ionicons name={mostrarConfirmacao ? "eye-off-outline" : "eye-outline"} size={21} color="#31506F" />
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity style={styles.button} onPress={handleRedefinicao} disabled={enviando}>
                <Text style={styles.buttonText}>{enviando ? "Redefinindo..." : "Redefinir senha"}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSolicitacao} disabled={enviando}>
              <Text style={styles.buttonText}>{enviando ? "Enviando..." : "Enviar link de recuperação"}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>Voltar para o login</Text>
          </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  keyboardView: { flex: 1, width: "100%" },
  scrollContent: { flexGrow: 1, justifyContent: "center", paddingVertical: 24 },
  card: { width: "100%", borderRadius: 24, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)" },
  badge: { width: 44, height: 44, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.14)", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  title: { fontSize: 28, color: "#fff", fontWeight: "800", marginBottom: 6 },
  subtitle: { color: "rgba(255,255,255,0.78)", fontSize: 13, textAlign: "center", lineHeight: 19, marginBottom: 22 },
  inputGroup: { width: "100%", marginBottom: 14 },
  label: { color: "#fff", marginBottom: 6, fontSize: 13, fontWeight: "700" },
  input: { backgroundColor: "rgba(245,247,255,0.95)", borderRadius: 16, paddingHorizontal: 14, height: 46, color: TutorPalette.background },
  passwordInput: { backgroundColor: "rgba(245,247,255,0.95)", borderRadius: 16, height: 46, flexDirection: "row", alignItems: "center" },
  passwordTextInput: { flex: 1, height: "100%", paddingLeft: 14, color: TutorPalette.background },
  eyeButton: { minWidth: 48, height: "100%", alignItems: "center", justifyContent: "center" },
  button: { width: "100%", backgroundColor: TutorPalette.primary, borderRadius: 16, paddingVertical: 13, shadowColor: TutorPalette.shadow, shadowOpacity: 0.25, shadowRadius: 12, shadowOffset: { width: 0, height: 6 } },
  buttonText: { color: "#fff", textAlign: "center", fontSize: 16, fontWeight: "800" },
  backButton: { marginTop: 18 },
  backText: { color: "#DDEBFF", fontSize: 13, fontWeight: "700", textDecorationLine: "underline" },
});
