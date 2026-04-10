import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

type LoginFormProps = {
  title: string;
  loading?: boolean;
  error?: string;
  onSubmit: (email: string, senha: string) => Promise<void>;
};

export default function LoginForm({ title, loading = false, error, onSubmit }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { width } = useWindowDimensions();
  const isCompact = width < 560;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <View style={styles.cardWrapper}>
        <LinearGradient
          colors={["rgba(8,20,36,0.92)", "rgba(11,36,70,0.92)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons
                name="lock-closed-outline"
                size={isCompact ? 22 : 26}
                color="#d5e6ff"
              />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>Entre com suas credenciais para acessar o painel.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#8da3c0"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              placeholder="Digite sua senha"
              placeholderTextColor="#8da3c0"
              style={styles.input}
            />
          </View>

          {!!error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={() => onSubmit(email, senha)}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footerHint}>Acesso restrito ao time de gestão.</Text>
        </LinearGradient>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
    backgroundColor: "#091523",
  },
  cardWrapper: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  card: {
    width: "100%",
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    borderColor: "rgba(141, 176, 222, 0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoCircle: {
    width: 56,
    height: 56,
    borderRadius: 999,
    backgroundColor: "rgba(53, 112, 189, 0.45)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    color: "#f4f8ff",
    fontWeight: "bold",
    textAlign: "center",
  },
  subtitle: {
    color: "#a9c0de",
    marginTop: 6,
    fontSize: 14,
    textAlign: "center",
  },
  inputGroup: {
    width: "100%",
    marginBottom: 10,
  },
  label: {
    color: "#d6e5f7",
    marginBottom: 6,
    fontSize: 13,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(235, 243, 255, 0.95)",
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 44,
    color: "#0a1d34",
    borderWidth: 1,
    borderColor: "rgba(78, 127, 194, 0.28)",
  },
  button: {
    width: "100%",
    backgroundColor: "#1d70ff",
    borderRadius: 12,
    paddingVertical: 13,
    marginTop: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fdfefe",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    color: "#ffd0d0",
    marginTop: 6,
    marginBottom: 2,
    fontWeight: "600",
    fontSize: 13,
  },
  footerHint: {
    marginTop: 12,
    color: "#9cb4d4",
    textAlign: "center",
    fontSize: 12,
  },
});
