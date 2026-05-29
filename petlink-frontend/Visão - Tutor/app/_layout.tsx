import { Stack } from "expo-router";
import { SafeAreaView, StatusBar, Platform } from "react-native";
import { SideMenu } from "@/components/SideMenu";
import { AuthProvider } from "../src/context/AuthContext";
import { SideMenuProvider } from "@/src/context/SideMenuContext";

export default function Layout() {
  return (
    <AuthProvider>
      <SideMenuProvider>
        <SafeAreaView style={{ flex: 1, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 }}>
          <Stack screenOptions={{ headerShown: false }} />
          <SideMenu />
        </SafeAreaView>
      </SideMenuProvider>
    </AuthProvider>
  );
}
