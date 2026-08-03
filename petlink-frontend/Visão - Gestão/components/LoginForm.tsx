import { managementTheme } from "@/constants/managementTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

type LoginFormProps = {
  title: string;
  subtitle?: string;
  profileLabel?: string;
  loading?: boolean;
  error?: string;
  onSubmit: (email: string, senha: string) => Promise<void>;
};

export default function LoginForm({
  title,
  subtitle = "Entre com suas credenciais para acessar o painel.",
  profileLabel = "Acesso restrito ao time de gestão.",
  loading = false,
  error,
  onSubmit,
}: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { width } = useWindowDimensions();
  const isCompact = width < 760;
  const shellWidth = isCompact ? Math.max(Math.min(width - 72, 420), 300) : "100%";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <LinearGradient colors={managementTheme.gradients.app} style={[styles.background, isCompact && styles.backgroundCompact]}>
        <View style={[styles.shell, { width: shellWidth }, isCompact && styles.shellCompact]}>
          {!isCompact && (
            <View style={styles.contextPanel}>
              <View>
                <View style={styles.brandMark}>
                  <Ionicons name="pulse-outline" size={22} color="#fff" />
                </View>
                <Text style={styles.contextEyebrow}>PetLink Gestão</Text>
                <Text style={styles.contextTitle}>Acesso seguro para a operação</Text>
                <Text style={styles.contextText}>
                  A área de gestão separa permissões por perfil e mantém os módulos críticos atrás de autenticação.
                </Text>
              </View>

              <View style={styles.contextStack}>
                {[
                  "Sessão protegida por token",
                  "Rotas filtradas por perfil",
                  "Operação integrada ao backend local",
                ].map((item) => (
                  <View key={item} style={styles.contextItem}>
                    <Ionicons name="checkmark-circle-outline" size={16} color={managementTheme.colors.success} />
                    <Text style={styles.contextItemText}>{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.formPanel}>
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                <Ionicons name="lock-closed-outline" size={24} color={managementTheme.colors.textStrong} />
              </View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </View>

            <View style={styles.formStack}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>E-mail</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="nome@petlink.com"
                  placeholderTextColor="#64748b"
                  style={styles.input}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                  value={senha}
                  onChangeText={setSenha}
                  secureTextEntry
                  textContentType="password"
                  placeholder="Digite sua senha"
                  placeholderTextColor="#64748b"
                  style={styles.input}
                />
              </View>

              {!!error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color="#fecaca" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <TouchableOpacity
                accessibilityRole="button"
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={() => onSubmit(email, senha)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Entrar no painel</Text>
                    <Ionicons name="arrow-forward-outline" size={17} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Ionicons name="shield-checkmark-outline" size={14} color={managementTheme.colors.textSubtle} />
              <Text style={styles.footerHint}>{profileLabel}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  backgroundCompact: {
    paddingHorizontal: 0,
  },
  shell: {
    maxWidth: 980,
    alignSelf: "center",
    flexDirection: "row",
    borderRadius: managementTheme.radii.xl,
    borderWidth: 1,
    borderColor: managementTheme.colors.borderStrong,
    backgroundColor: "rgba(15, 23, 42, 0.84)",
    overflow: "hidden",
  },
  shellCompact: {
    maxWidth: 420,
    flexDirection: "column",
  },
  contextPanel: {
    flex: 1,
    minHeight: 500,
    justifyContent: "space-between",
    padding: 30,
    backgroundColor: "rgba(8, 13, 22, 0.76)",
  },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: managementTheme.colors.primary,
    marginBottom: 18,
  },
  contextEyebrow: {
    color: managementTheme.colors.accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  contextTitle: {
    color: managementTheme.colors.textStrong,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "900",
    marginTop: 8,
    maxWidth: 360,
  },
  contextText: {
    color: managementTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    maxWidth: 390,
  },
  contextStack: {
    gap: 10,
  },
  contextItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  contextItemText: {
    color: managementTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  formPanel: {
    flex: 1,
    padding: 30,
    justifyContent: "center",
    gap: 22,
  },
  header: {
    alignItems: "flex-start",
  },
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: managementTheme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.22)",
  },
  title: {
    color: managementTheme.colors.textStrong,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "900",
  },
  subtitle: {
    color: managementTheme.colors.textMuted,
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
  },
  formStack: {
    gap: 13,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    color: managementTheme.colors.text,
    fontSize: 13,
    fontWeight: "800",
  },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: managementTheme.radii.md,
    paddingHorizontal: 14,
    minHeight: 46,
    color: managementTheme.colors.inputText,
    borderWidth: 1,
    borderColor: "rgba(203, 213, 225, 0.65)",
    fontSize: 14,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.34)",
    backgroundColor: managementTheme.colors.dangerSoft,
    borderRadius: managementTheme.radii.md,
    padding: 11,
  },
  errorText: {
    flex: 1,
    color: "#fecaca",
    fontWeight: "700",
    fontSize: 13,
    lineHeight: 18,
  },
  button: {
    minHeight: 48,
    backgroundColor: managementTheme.colors.primary,
    borderRadius: managementTheme.radii.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.72,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 15,
    fontWeight: "900",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: managementTheme.colors.border,
    paddingTop: 14,
  },
  footerHint: {
    color: managementTheme.colors.textSubtle,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
  },
});
