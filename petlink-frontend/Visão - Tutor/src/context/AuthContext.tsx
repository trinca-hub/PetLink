import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginService} from "../api/authService";

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

  // Carrega token e usuário do armazenamento local ao iniciar
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
async function login(email: string, senha: string) {
  const result: any = await loginService(email, senha);
  console.log("🔐 Resultado login:", result);

  if (result?.ok && result?.data?.code === 1) {
    const tokenRecebido = result.data.data.token;
    const usuarioRecebido = result.data.data.usuario;

    setToken(tokenRecebido);
    setUser(usuarioRecebido);

    await AsyncStorage.setItem("token", tokenRecebido);
    await AsyncStorage.setItem("usuario", JSON.stringify(usuarioRecebido));

    return { code: 1 };
  }

  return { code: 0, message: result?.data?.message || "Erro ao fazer login" };
}


  // LOGOUT
  async function logout() {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("usuario");
  }

  // JSX de retorno do contexto
  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
