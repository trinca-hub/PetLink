import LoginForm from "@/components/LoginForm";
import { AuthContext } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";

export default function LoginVet() {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(email: string, senha: string) {
    setLoading(true);
    setError("");

    const result = await login("vet", email, senha);

    if (result.code === 1) {
      router.replace("/home-vet");
    } else {
      setError(result.message || "E-mail ou senha inválidos");
    }

    setLoading(false);
  }

  return (
    <LoginForm
      title="Login Veterinário"
      subtitle="Acesse agenda e serviços veterinários."
      profileLabel="Acesso veterinário."
      onSubmit={handleLogin}
      loading={loading}
      error={error}
    />
  );
}
