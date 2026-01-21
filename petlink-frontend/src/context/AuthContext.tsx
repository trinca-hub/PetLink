import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginService, getMeService } from "../api/authService";

type User = {
  id: number;
  nome: string;
  email: string;
  telefone?: string;
  cep?: string;
  uf?: string;
  cidade?: string;
  bairro?: string;
  rua?: string;
  numero?: number;
};

type AuthContextType = {
  token: string | null;
  user: User | null;
  login: (email: string, senha: string) => Promise<any>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: any) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Carrega usuário e token ao iniciar
  useEffect(() => {
    async function loadStorage() {
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("usuario");

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }

    loadStorage();
  }, []);

  // Login
  async function login(email: string, senha: string) {
    const result: any = await loginService(email, senha);
    console.log("🔐 Resultado login:", result);

    if (result?.data?.code === 1) {
      const tokenRecebido = result.data.data;

      setToken(tokenRecebido);
      await AsyncStorage.setItem("token", tokenRecebido);

      const me = await getMeService(tokenRecebido);
      console.log("📥 Resultado getMeService:", me);

      if (me?.data?.code === 1) {
        const userData = me.data.data;

        setUser(userData);
        await AsyncStorage.setItem("usuario", JSON.stringify(userData));
      } else {
        console.warn("⚠️ Erro ao obter dados do usuário:", me);
      }

      return { code: 1 };
    }

    return { code: 0, message: "Erro ao fazer login" };
  }

  // Logout
  async function logout() {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("usuario");
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
