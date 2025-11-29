import { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginService } from "../api/authService";

type AuthContextType = {
  token: string | null;
  login: (email: string, senha: string) => Promise<any>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: any) {
  const [token, setToken] = useState<string | null>(null);

  async function login(email: string, senha: string) {
    console.log("Chamou login()", email, senha);

    const result = await loginService(email, senha).catch((err) => {
      console.log("ERRO NO FETCH:", err);
    });

    console.log("Resultado da API:", result);

    if (result && result.code === 1) {

      const tokenRecebido = result.data.token;     // ✔ token correto
      const usuarioRecebido = result.data.usuario; // ✔ dados do usuário logado

      // salva no state
      setToken(tokenRecebido);

      // salva no armazenamento interno
      await AsyncStorage.setItem("token", tokenRecebido);
      await AsyncStorage.setItem("usuario", JSON.stringify(usuarioRecebido));

      return result;
    }

    return { code: 0, message: "Erro ao fazer login" };
  }


  function logout() {
    setToken(null);
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("usuario");
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
