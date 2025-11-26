import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { registerService } from "../src/api/authService";
import { useRouter } from "expo-router";

export default function Register() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function handleRegister() {
    const result = await registerService(nome, email, senha);

    if (result.sucesso) {
      alert("Conta criada!");
      router.push("../login");
    } else {
      alert("Erro ao cadastrar!");
    }
  }

  return (
    <View style={{ padding: 20 }}>
      <Text>Nome</Text>
      <TextInput
        value={nome}
        onChangeText={setNome}
        style={{ borderWidth: 1, marginBottom: 10 }}
      />

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

      <Button title="Cadastrar" onPress={handleRegister} />
    </View>
  );
}
