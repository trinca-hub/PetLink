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
