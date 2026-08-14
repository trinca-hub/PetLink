import { useState } from "react";
import {
  Alert,
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
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { requestPasswordResetService, resetPasswordService } from "@/src/api/authService";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { PetLinkAuthBackdrop, PetLinkAuthHeader } from "@/components/PetLinkAuthVisual";
import { isPasswordAccepted } from "@/src/utils/passwordStrength";

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

  const exibindoRedefinicao = Boolean(token || codigoSolicitado);
  const subtitulo = exibindoRedefinicao
    ? "Informe o código recebido e crie sua nova senha."
    : "Informe seu e-mail para receber um código seguro de recuperação.";

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
    <LinearGradient colors={["#030508", "#090C12", "#020305"]} style={styles.page}>
      <PetLinkAuthBackdrop />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.form}>
              <PetLinkAuthHeader title="Redefinir senha" subtitle={subtitulo} />

              <View style={styles.field}>
                <Ionicons name="mail-outline" size={22} color="#287AF5" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="E-mail cadastrado"
                  placeholderTextColor="#8B909A"
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                />
              </View>

              {exibindoRedefinicao && (
                <>
                  {!token && (
                    <View style={styles.field}>
                      <Ionicons name="key-outline" size={22} color="#287AF5" />
                      <TextInput
                        value={token}
                        onChangeText={setToken}
                        placeholder="Código de recuperação"
                        placeholderTextColor="#8B909A"
                        style={styles.input}
                        autoCapitalize="characters"
                        autoCorrect={false}
                      />
                    </View>
                  )}

                  <View style={[styles.field, styles.passwordField]}>
                    <Ionicons name="lock-closed-outline" size={22} color="#287AF5" />
                    <TextInput
                      value={novaSenha}
                      onChangeText={setNovaSenha}
                      placeholder="Nova senha"
                      placeholderTextColor="#8B909A"
                      style={styles.input}
                      secureTextEntry={!mostrarNovaSenha}
                      autoComplete="new-password"
                    />
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={mostrarNovaSenha ? "Ocultar senha" : "Mostrar senha"}
                      onPress={() => setMostrarNovaSenha((value) => !value)}
                      style={styles.eyeButton}
                    >
                      <Ionicons name={mostrarNovaSenha ? "eye-off-outline" : "eye-outline"} size={23} color="#9AA0AA" />
                    </TouchableOpacity>
                  </View>

                  <PasswordStrengthIndicator password={novaSenha} />

                  <View style={styles.confirmationSpacing}>
                    <View style={styles.field}>
                      <Ionicons name="shield-checkmark-outline" size={22} color="#287AF5" />
                      <TextInput
                        value={confirmacaoSenha}
                        onChangeText={setConfirmacaoSenha}
                        placeholder="Confirmar nova senha"
                        placeholderTextColor="#8B909A"
                        style={styles.input}
                        secureTextEntry={!mostrarConfirmacao}
                        autoComplete="new-password"
                      />
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={mostrarConfirmacao ? "Ocultar senha" : "Mostrar senha"}
                        onPress={() => setMostrarConfirmacao((value) => !value)}
                        style={styles.eyeButton}
                      >
                        <Ionicons name={mostrarConfirmacao ? "eye-off-outline" : "eye-outline"} size={23} color="#9AA0AA" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </>
              )}

              <TouchableOpacity accessibilityRole="button" style={[styles.primaryButton, enviando && styles.buttonDisabled]} onPress={exibindoRedefinicao ? handleRedefinicao : handleSolicitacao} disabled={enviando}>
                <LinearGradient colors={["#1764D9", "#0E51C7"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryGradient}>
                  <Text style={styles.primaryButtonText}>
                    {enviando ? (exibindoRedefinicao ? "Redefinindo..." : "Enviando...") : exibindoRedefinicao ? "Redefinir senha" : "Enviar código"}
                  </Text>
                  {!enviando && <Ionicons name="paw" size={28} color="rgba(255,255,255,0.28)" style={styles.buttonPaw} />}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity accessibilityRole="button" style={styles.backButton} onPress={() => router.back()}>
                <Ionicons name="arrow-back-outline" size={18} color="#287AF5" />
                <Text style={styles.backText}>Voltar para o login</Text>
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
  confirmationSpacing: { marginTop: 13 },
  primaryButton: { width: "100%", height: 62, marginTop: 25, borderRadius: 17, overflow: "hidden", shadowColor: "#0B5DDB", shadowOpacity: 0.38, shadowRadius: 13, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  primaryGradient: { flex: 1, justifyContent: "center", alignItems: "center" },
  primaryButtonText: { color: "#fff", fontSize: 20, fontWeight: "800" },
  buttonPaw: { position: "absolute", right: 24 },
  buttonDisabled: { opacity: 0.58 },
  backButton: { flexDirection: "row", alignSelf: "center", alignItems: "center", gap: 7, marginTop: 23, padding: 6 },
  backText: { color: "#287AF5", fontSize: 15, fontWeight: "700" },
});
