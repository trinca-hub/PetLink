import { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { loginService } from "../api/authService";

type AuthContextType = {
  user: any;
  login: (email: string, senha: string) => Promise<any>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: any) {
  const [user, setUser] = useState(null);

  async function login(email: string, senha: string) {
    const result = await loginService(email, senha);
    if (result.sucesso) {
      setUser(result.usuario);
      await AsyncStorage.setItem("user", JSON.stringify(result.usuario));
    }
    return result;
  }

  function logout() {
    setUser(null);
    AsyncStorage.removeItem("user");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
