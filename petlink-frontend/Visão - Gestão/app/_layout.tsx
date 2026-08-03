import { Stack, usePathname, useRouter } from "expo-router";
import { AuthContext, AuthProvider } from "@/src/context/AuthContext";
import { useContext, useEffect } from "react";

function RoleRouteGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { token, perfil, hydrated } = useContext(AuthContext);

  useEffect(() => {
    if (!hydrated) return;

    const publicRoutes = ["/", "/login-adm", "/login-func", "/login-vet"];
    const isPublic = publicRoutes.includes(pathname);

    if (!token) {
      if (!isPublic) {
        router.replace("/");
      }
      return;
    }

    if (!perfil) {
      router.replace("/");
      return;
    }

    const homeByPerfil = {
      adm: "/home-adm",
      func: "/home-func",
      vet: "/home-vet",
    } as const;

    if (isPublic) {
      router.replace(homeByPerfil[perfil]);
      return;
    }

    const allowedByPerfil: Record<typeof perfil, string[]> = {
      adm: [
        "/home-adm",
        "/adm-funcionarios",
        "/adm-veterinarios",
        "/adm-usuarios",
        "/adm-produtos",
        "/adm-anuncios",
        "/adm-cadastro-adm",
        "/adm-pets",
        "/adm-pedidos",
        "/adm-servicos",
      ],
      func: ["/home-func", "/adm-produtos", "/adm-pets", "/adm-pedidos", "/adm-servicos"],
      vet: ["/home-vet", "/adm-servicos", "/vet-agenda", "/vet-solicitacoes"],
    };

    const allowedRoutes = allowedByPerfil[perfil];
    const isAllowed = allowedRoutes.includes(pathname);
    if (!isAllowed) {
      router.replace(homeByPerfil[perfil]);
    }
  }, [hydrated, token, perfil, pathname, router]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function Layout() {
  return (
    <AuthProvider>
      <RoleRouteGuard />
    </AuthProvider>
  );
}
