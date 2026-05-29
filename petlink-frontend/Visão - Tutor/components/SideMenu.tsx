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
import { router } from "expo-router";

import { useSideMenu } from "@/src/context/SideMenuContext";
import { AuthContext } from "@/src/context/AuthContext";

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

  const goTo = (path: string) => {
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
              <Pressable style={styles.item} onPress={() => goTo("/agendamentos")}>
                <Ionicons name="calendar-outline" size={18} color="#E8F0FF" />
                <Text style={styles.itemText}>Agendamentos</Text>
              </Pressable>

              <Pressable style={styles.item} onPress={() => goTo("/(tabs)/petinder")}
              >
                <Ionicons name="paw-outline" size={18} color="#E8F0FF" />
                <Text style={styles.itemText}>PeTinder</Text>
              </Pressable>

              <Pressable style={styles.item} onPress={() => goTo("/(tabs)/petfinder")}
              >
                <Ionicons name="search-outline" size={18} color="#E8F0FF" />
                <Text style={styles.itemText}>PetFinder</Text>
              </Pressable>

              <Pressable style={styles.item} onPress={() => goTo("/(tabs)/paypet")}
              >
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
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  drawer: {
    width: "78%",
    height: "100%",
    backgroundColor: "#0B1F3A",
    paddingHorizontal: 18,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.12)",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 18,
  },
  name: {
    marginTop: 10,
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
  },
  email: {
    marginTop: 2,
    color: "rgba(255,255,255,0.7)",
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
    paddingVertical: 10,
  },
  itemText: {
    color: "#E8F0FF",
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
    borderTopColor: "rgba(255,255,255,0.12)",
  },
  logoutText: {
    color: "#FFB4B4",
    fontWeight: "800",
    fontSize: 14,
  },
});
