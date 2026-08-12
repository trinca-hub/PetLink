import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import PasswordStrength from "@/components/PasswordStrength";
import { isPasswordAccepted } from "@/src/utils/passwordStrength";
import { PerfilGestao, requestManagementPasswordReset, resetManagementPassword } from "@/src/api/authService";
import { managementTheme } from "@/constants/managementTheme";

export default function RedefinirSenhaGestao() {
  const router = useRouter();
  const params = useLocalSearchParams<{ perfil?: PerfilGestao; email?: string; token?: string }>();
  const perfil = (["adm", "func", "vet"].includes(params.perfil || "") ? params.perfil : "adm") as PerfilGestao;
  const [email, setEmail] = useState(params.email || "");
  const [token, setToken] = useState(params.token || "");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [etapaCodigo, setEtapaCodigo] = useState(!!params.token);
  const [verSenha, setVerSenha] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const solicitar = async () => {
    const resposta: any = await requestManagementPasswordReset(perfil, email.trim().toLowerCase());
    if (!resposta.ok) return Alert.alert("Erro", resposta.data?.message || "Tente novamente.");
    setEtapaCodigo(true);
    Alert.alert("Verifique seu e-mail", "Copie o código recebido e informe-o abaixo.");
  };

  const redefinir = async () => {
    if (!token.trim()) return Alert.alert("Informe o código", "Cole o código recebido no e-mail.");
    if (!isPasswordAccepted(senha)) return Alert.alert("Senha fraca", "Use 8+ caracteres e 3 tipos: maiúscula, minúscula, número ou símbolo.");
    if (senha !== confirmacao) return Alert.alert("Senhas diferentes", "A confirmação não confere.");

    setEnviando(true);
    try {
      const resposta: any = await resetManagementPassword(perfil, email.trim().toLowerCase(), token.replace(/\s/g, ""), senha);
      if (!resposta.ok) return Alert.alert("Erro", resposta.data?.message || "Código inválido ou expirado.");
      setSucesso(true);
      setTimeout(() => router.replace(perfil === "adm" ? "/login-adm" : perfil === "func" ? "/login-func" : "/login-vet"), 1400);
    } finally {
      setEnviando(false);
    }
  };

  return <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.page}>
    <LinearGradient colors={managementTheme.gradients.app} style={styles.page}>
      <View style={styles.card}>
        <Ionicons name="lock-closed-outline" color="#fff" size={28} />
        <Text style={styles.title}>Redefinir senha</Text>
        <Text style={styles.subtitle}>Perfil: {perfil === "adm" ? "Administrador" : perfil === "func" ? "Funcionário" : "Veterinário"}</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" editable={!etapaCodigo} />
        {etapaCodigo ? <>
          <TextInput style={styles.input} value={token} onChangeText={setToken} placeholder="Código de recuperação" autoCapitalize="characters" />
          <View style={styles.password}><TextInput style={styles.passwordText} value={senha} onChangeText={setSenha} placeholder="Nova senha" secureTextEntry={!verSenha} /><TouchableOpacity onPress={() => setVerSenha(!verSenha)} style={styles.eye}><Ionicons name={verSenha ? "eye-off-outline" : "eye-outline"} size={20} /></TouchableOpacity></View>
          <PasswordStrength password={senha} />
          <TextInput style={styles.input} value={confirmacao} onChangeText={setConfirmacao} placeholder="Confirmar nova senha" secureTextEntry={!verSenha} />
          {sucesso && <View style={styles.success}><Ionicons name="checkmark-circle" size={20} color="#bbf7d0" /><Text style={styles.successText}>Senha redefinida! Redirecionando para o login...</Text></View>}
          <TouchableOpacity style={[styles.button, (enviando || sucesso) && styles.buttonDisabled]} onPress={redefinir} disabled={enviando || sucesso}><Text style={styles.buttonText}>{enviando ? "Redefinindo..." : sucesso ? "Senha atualizada" : "Redefinir senha"}</Text></TouchableOpacity>
        </> : <TouchableOpacity style={styles.button} onPress={solicitar}><Text style={styles.buttonText}>Enviar código</Text></TouchableOpacity>}
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>Voltar ao login</Text></TouchableOpacity>
      </View>
    </LinearGradient>
  </KeyboardAvoidingView>;
}

const styles = StyleSheet.create({
  page: { flex: 1 }, card: { width: "90%", maxWidth: 430, alignSelf: "center", margin: "auto", backgroundColor: "rgba(15,23,42,.92)", borderRadius: 20, padding: 24, gap: 12 },
  title: { color: "#fff", fontSize: 26, fontWeight: "900" }, subtitle: { color: "#94a3b8" }, input: { backgroundColor: "#f8fafc", height: 48, borderRadius: 12, paddingHorizontal: 14 },
  password: { backgroundColor: "#f8fafc", height: 48, borderRadius: 12, flexDirection: "row" }, passwordText: { flex: 1, paddingLeft: 14 }, eye: { width: 48, justifyContent: "center", alignItems: "center" },
  button: { height: 48, borderRadius: 12, backgroundColor: managementTheme.colors.primary, justifyContent: "center" }, buttonDisabled: { opacity: .65 }, buttonText: { color: "#fff", fontWeight: "900", textAlign: "center" }, success: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#166534", borderRadius: 10, padding: 12 }, successText: { color: "#dcfce7", flex: 1, fontWeight: "700" }, back: { color: "#7dd3fc", fontWeight: "800", textAlign: "center", marginTop: 8 },
});
