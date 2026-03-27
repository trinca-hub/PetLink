import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { registerService } from "../src/api/authService";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


export default function Register() {
  const router = useRouter();

  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    cep: "",
    uf: "",
    cidade: "",
    bairro: "",
    rua: "",
    numero: "",
    email: "",
    senha: "",
  });

  function handleChange(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleRegister() {
    const payload = {
      nome: form.nome,
      telefone: form.telefone,
      cep: form.cep,
      uf: form.uf,
      cidade: form.cidade,
      bairro: form.bairro,
      rua: form.rua,
      numero: Number(form.numero),
      email: form.email,
      senha: form.senha,
    };

    console.log("➡️ Payload enviado:", payload);

    const result = await registerService(payload);

    console.log("➡️ Resposta da API:", result);

    if (result.code === 1) {
      alert("Conta criada!");
      router.replace("/login");
    } else {
      alert(result.message || "Erro ao cadastrar!");
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
        style={{ flex: 1 }}
      >
        <LinearGradient
          colors={["rgba(0,0,0,0.6)", "#0a58ca"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
     <KeyboardAwareScrollView
  extraScrollHeight={200}
  keyboardOpeningTime={0}
  enableOnAndroid={true}
  showsVerticalScrollIndicator={false}
>


            <Text style={styles.title}>Cadastro</Text>

            <Ionicons
              name="person-add-outline"
              size={80}
              color="#fff"
              style={{ alignSelf: "center", marginBottom: 20 }}
            />

            {Object.keys(form).map((key) => (
              <View key={key} style={styles.inputGroup}>
                <Text style={styles.label}>{key.toUpperCase()}</Text>
                <TextInput
                  value={form[key as keyof typeof form]}
                  onChangeText={(v) => handleChange(key, v)}
                  style={styles.input}
                  placeholder={`Digite ${key}`}
                  placeholderTextColor="#ccc"
                />
              </View>
            ))}

            <TouchableOpacity style={styles.button} onPress={handleRegister}>
              <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>
              Já tem conta?{" "}
              <Text
                style={styles.link}
                onPress={() => router.push("/login")}
              >
                Entrar
              </Text>
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
    paddingHorizontal: 25,
    justifyContent: "center",
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: 25,
    marginVertical: 40,
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 10,
  },
  inputGroup: {
    width: "100%",
    marginBottom: 12,
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
    marginTop: 15,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  footerText: {
    color: "#fff",
    marginTop: 18,
    alignSelf: "center",
  },
  link: {
    color: "#dceaff",
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
