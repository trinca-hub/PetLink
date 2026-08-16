import React, { useMemo } from "react";
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { type Href, router } from "expo-router";

import { useSideMenu } from "@/src/context/SideMenuContext";
import { AuthContext } from "@/src/context/AuthContext";
import { TutorPalette } from "@/constants/theme";

export function SideMenu() {
  const { isOpen, closeMenu } = useSideMenu();
  const { user, logout } = React.useContext(AuthContext);

  const initials = useMemo(() => {
    const name = String(user?.nome || "Usuario").trim();
    if (!name) return "U";
    const parts = name.split(" ").filter(Boolean);
    const first = parts[0]?.[0] ?? "U";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] : "";
    return `${first}${last}`.toUpperCase();
  }, [user?.nome]);

  const handleLogout = () => {
    Alert.alert("Sair da conta", "Tem certeza que deseja sair?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await logout();
          closeMenu();
          router.push("/login");
        },
      },
    ]);
  };

  const goTo = (path: Href) => {
    closeMenu();
    router.push(path);
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={closeMenu}>
      <Pressable onPress={closeMenu} style={styles.overlay}>
        <Pressable onPress={() => {}} style={styles.drawer}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <Text style={styles.name}>{user?.nome || "Usuario"}</Text>
              <Text style={styles.email}>{user?.email || ""}</Text>
            </View>

            <View style={styles.section}>
              <Pressable style={styles.item} onPress={() => goTo("/agendamentos/novo")}>
                <Ionicons name="add-circle-outline" size={18} color="#E8F0FF" />
                <Text style={styles.itemText}>Solicitar consulta</Text>
              </Pressable>

              <Pressable style={styles.item} onPress={() => goTo("/agendamentos")}>
                <Ionicons name="calendar-outline" size={18} color="#E8F0FF" />
                <Text style={styles.itemText}>Agendamentos</Text>
              </Pressable>

              <Pressable style={styles.item} onPress={() => goTo("/(tabs)/petinder")}>
                <Ionicons name="paw-outline" size={18} color="#E8F0FF" />
                <Text style={styles.itemText}>PeTinder</Text>
              </Pressable>

              <Pressable style={styles.item} onPress={() => goTo("/(tabs)/petfinder")}>
                <Ionicons name="search-outline" size={18} color="#E8F0FF" />
                <Text style={styles.itemText}>PetFinder</Text>
              </Pressable>

              <Pressable style={styles.item} onPress={() => goTo("/(tabs)/paypet")}>
                <Ionicons name="cash-outline" size={18} color="#E8F0FF" />
                <Text style={styles.itemText}>PayPet</Text>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={18} color="#FFB4B4" />
                <Text style={styles.logoutText}>Sair</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(1, 8, 20, 0.75)",
  },
  drawer: {
    width: "78%",
    height: "100%",
    backgroundColor: TutorPalette.background,
    paddingHorizontal: 18,
    borderRightWidth: 1,
    borderRightColor: TutorPalette.border,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: TutorPalette.border,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: TutorPalette.text,
    fontWeight: "900",
    fontSize: 18,
  },
  name: {
    marginTop: 10,
    color: TutorPalette.text,
    fontWeight: "900",
    fontSize: 16,
  },
  email: {
    marginTop: 2,
    color: TutorPalette.muted,
    fontWeight: "700",
    fontSize: 12,
  },
  section: {
    paddingTop: 16,
    gap: 10,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  itemText: {
    color: TutorPalette.text,
    fontWeight: "800",
    fontSize: 14,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 18,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: TutorPalette.border,
  },
  logoutText: {
    color: TutorPalette.danger,
    fontWeight: "800",
    fontSize: 14,
  },
});
