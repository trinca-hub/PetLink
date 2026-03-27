import { useState, useContext } from "react";
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

export default function Login() {
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin() {
  try {
    const result = await login(email, senha);
    console.log("RESULTADO NO LOGIN:", result);

    if (result?.code === 1) {
      router.replace("/(tabs)");
    } else {
      alert(result?.message || "Credenciais inválidas");
    }
  } catch (error) {
    console.error("Erro inesperado no login:", error);
    alert("Erro inesperado ao tentar logar.");
  }
}


  return (
    <ImageBackground
      source={require("../assets/images/background.jpg")} // sua imagem
      style={styles.background}
      resizeMode="cover"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ width: "100%" }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "#0a58ca"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          <Text style={styles.title}>Login</Text>

          <Ionicons name="person-circle-outline" size={90} color="#fff" style={{ marginBottom: 20 }} />

          {/* E-mail */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#ccc"
              style={styles.input}
              autoCapitalize="none"
            />
          </View>

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              placeholder="Digite sua senha"
              placeholderTextColor="#ccc"
              style={styles.input}
            />
          </View>

          {/* Botão */}
          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>
            Não tem conta?{" "}
            <Text
              style={styles.link}
              onPress={() => router.push("/register")}
            >
              Cadastra-se
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
    paddingHorizontal: 25,
  },
  card: {
    width: "100%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 10,
  },
  label: {
    color: "#fff",
    marginBottom: 4,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    height: 40,
  },
  button: {
    width: "100%",
    backgroundColor: "#0d6efd",
    borderRadius: 20,
    paddingVertical: 12,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  footerText: {
    color: "#fff",
    marginTop: 12,
  },
  link: {
    color: "#dceaff",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
