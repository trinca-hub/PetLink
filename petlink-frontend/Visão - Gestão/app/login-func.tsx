import LoginForm from "@/components/LoginForm";
import { AuthContext } from "@/src/context/AuthContext";
import { useRouter } from "expo-router";
import { useContext, useState } from "react";

export default function LoginFunc() {
  const { login } = useContext(AuthContext);
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(email: string, senha: string) {
    setLoading(true);
    setError("");

    const result = await login("func", email, senha);

    if (result.code === 1) {
      router.replace("/home-func");
    } else {
      setError(result.message || "Email ou senha inválidos");
    }

    setLoading(false);
  }

  return <LoginForm title="Login Funcionário" onSubmit={handleLogin} loading={loading} error={error} />;
}
