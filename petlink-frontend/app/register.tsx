import { useState } from "react";
import { View, Text, TextInput, Button, ScrollView } from "react-native";
import { registerService } from "../src/api/authService";
import { useRouter } from "expo-router";

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
    setForm({ ...form, [key]: value });
  }

  async function handleRegister() {
    const payload = {
      ...form,
      numero: Number(form.numero),
    };

    const result = await registerService(payload);

    if (result.code === 1) {
      alert("Conta criada!");
      router.push("/login");
    } else {
      alert(result.message || "Erro ao cadastrar!");
    }
  }

  return (
    <ScrollView style={{ padding: 20 }}>
      {Object.keys(form).map((key) => (
        <View key={key} style={{ marginBottom: 10 }}>
          <Text>{key.toUpperCase()}</Text>
          <TextInput
            value={form[key as keyof typeof form]}
            onChangeText={(v) => handleChange(key, v)}
            style={{ borderWidth: 1 }}
          />
        </View>
      ))}

      <Button title="Cadastrar" onPress={handleRegister} />
    </ScrollView>
  );
}
