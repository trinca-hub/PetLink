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

  return result;
}

  function logout() {
    setToken(null);
    AsyncStorage.removeItem("token");
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
