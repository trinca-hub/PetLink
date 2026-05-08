import AdminActionCard from "@/components/AdminActionCard";
import { FUNC_MENU } from "@/constants/funcMenu";
import { AuthContext } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useContext } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeFunc() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <LinearGradient colors={["#071321", "#0d1b2a", "#12263f"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.badge}>Funcionário</Text>
            <Text style={styles.title}>Painel Operacional</Text>
            <Text style={styles.subtitle}>Olá, {user?.nome || "Funcionário"}. Acesse apenas os módulos operacionais permitidos.</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#dbe9ff" />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsWrap}>
          <Text style={styles.sectionTitle}>Ações disponíveis</Text>

          {FUNC_MENU.map((item) => (
            <AdminActionCard
              key={item.route}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              onPress={() => router.push(item.route)}
            />
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 16,
  },
  header: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.30)",
    backgroundColor: "rgba(19, 37, 59, 0.9)",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  badge: {
    color: "#9fc0f6",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  title: {
    color: "#eff5ff",
    fontSize: 30,
    fontWeight: "700",
    lineHeight: 34,
  },
  subtitle: {
    color: "#b7c8e8",
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(26, 72, 130, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(138, 180, 248, 0.4)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  logoutText: {
    color: "#dbe9ff",
    fontWeight: "700",
    fontSize: 13,
  },
  actionsWrap: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.20)",
    backgroundColor: "rgba(13, 32, 53, 0.88)",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    color: "#edf4ff",
    fontSize: 16,
    fontWeight: "700",
  },
});
