import { Stack } from "expo-router";
import { SideMenu } from "@/components/SideMenu";
import { AuthProvider } from "../src/context/AuthContext";
import { SideMenuProvider } from "@/src/context/SideMenuContext";

export default function Layout() {
  return (
    <AuthProvider>
      <SideMenuProvider>
        <Stack />
        <SideMenu />
      </SideMenuProvider>
    </AuthProvider>
  );
}
