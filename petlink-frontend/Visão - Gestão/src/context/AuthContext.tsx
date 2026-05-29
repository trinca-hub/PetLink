import { createContext, useEffect, useState } from "react";
import { loginGestaoService, PerfilGestao } from "@/src/api/authService";
import { clearAuthData, getAuthData, saveAuthData } from "@/src/storage/authStorage";

type AuthContextType = {
  token: string | null;
  user: any;
  perfil: PerfilGestao | null;
  hydrated: boolean;
  login: (perfil: PerfilGestao, email: string, senha: string) => Promise<{ code: number; message?: string }>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType>(null!);

function resolveUserFromPayload(payload: any) {
  return (
    payload?.administrador ||
    payload?.veterinario ||
    payload?.funcionario ||
    payload?.usuario ||
    null
  );
}

export function AuthProvider({ children }: any) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [perfil, setPerfil] = useState<PerfilGestao | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    async function loadStorage() {
      const data = await getAuthData();
      if (data.token) {
        setToken(data.token);
        setUser(data.user);
        setPerfil(data.perfil);
      }

      setHydrated(true);
    }

    loadStorage();
  }, []);

  async function login(perfilLogin: PerfilGestao, email: string, senha: string) {
    const result: any = await loginGestaoService(perfilLogin, email, senha);

    if (result?.ok) {
      const tokenRecebido = result.data?.data?.token ?? result.data?.token;
      const userRecebido = resolveUserFromPayload(result.data?.data ?? result.data);

      if (!tokenRecebido || !userRecebido) {
        return { code: 0, message: "Resposta de login inválida" };
      }

      setToken(tokenRecebido);
      setUser(userRecebido);
      setPerfil(perfilLogin);

      await saveAuthData(tokenRecebido, userRecebido, perfilLogin);
      return { code: 1 };
    }

    return { code: 0, message: result?.data?.message || "Email ou senha inválidos" };
  }

  async function logout() {
    setToken(null);
    setUser(null);
    setPerfil(null);
    await clearAuthData();
  }

  return (
    <AuthContext.Provider value={{ token, user, perfil, hydrated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
