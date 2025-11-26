import { useState, useContext } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { AuthContext } from "../src/context/AuthContext";
import { useRouter } from "expo-router";

export default function Login() {
  const { login } = useContext(AuthContext);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleLogin() {
    const result = await login(email, senha);

    if (result.code === 1) {
      router.push("/(tabs)");
    } else {
      alert(result.message || "Credenciais inválidas");
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Text>Senha</Text>
      <TextInput
        value={senha}
        onChangeText={setSenha}
        secureTextEntry
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
}
