import AsyncStorage from "@react-native-async-storage/async-storage";
import { PerfilGestao } from "@/src/api/authService";

const TOKEN_KEY = "gestao_token";
const USER_KEY = "gestao_user";
const PERFIL_KEY = "gestao_perfil";

export async function saveAuthData(token: string, user: any, perfil: PerfilGestao) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  await AsyncStorage.setItem(PERFIL_KEY, perfil);
}

export async function getAuthData() {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const userRaw = await AsyncStorage.getItem(USER_KEY);
  const perfil = await AsyncStorage.getItem(PERFIL_KEY);

  return {
    token,
    user: userRaw ? JSON.parse(userRaw) : null,
    perfil: (perfil as PerfilGestao | null) ?? null,
  };
}

export async function clearAuthData() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
  await AsyncStorage.removeItem(PERFIL_KEY);
}
