import AdminActionCard from "@/components/AdminActionCard";
import { ADMIN_MENU } from "@/constants/adminMenu";
import { useAdminSummary } from "@/hooks/useAdminSummary";
import { AuthContext } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useContext } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeAdm() {
  const router = useRouter();
  const { token, user, logout } = useContext(AuthContext);
  const { summary, loading, refresh } = useAdminSummary(token);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <LinearGradient colors={["#071321", "#0d1b2a", "#12263f"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.badge}>Administrador</Text>
            <Text style={styles.title}>Dashboard de Gestão</Text>
            <Text style={styles.subtitle}>Olá, {user?.nome || "Administrador"}. Gerencie o sistema por módulos.</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#dbe9ff" />
            <Text style={styles.logoutText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryWrap}>
          <View style={styles.summaryHeader}>
            <Text style={styles.sectionTitle}>Resumo geral</Text>
            <TouchableOpacity onPress={refresh}>
              <Text style={styles.refreshText}>{loading ? "Atualizando..." : "Atualizar"}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{summary.usuarios}</Text>
              <Text style={styles.summaryLabel}>Usuários</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{summary.produtos}</Text>
              <Text style={styles.summaryLabel}>Produtos</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{summary.anuncios}</Text>
              <Text style={styles.summaryLabel}>Anúncios</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{summary.funcionarios + summary.veterinarios}</Text>
              <Text style={styles.summaryLabel}>Equipe</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsWrap}>
          <Text style={styles.sectionTitle}>Ações administrativas</Text>

          {ADMIN_MENU.map((item) => (
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
  summaryWrap: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.20)",
    backgroundColor: "rgba(13, 32, 53, 0.88)",
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  refreshText: {
    color: "#9fc0f6",
    fontWeight: "700",
    fontSize: 13,
  },
  sectionTitle: {
    color: "#edf4ff",
    fontSize: 16,
    fontWeight: "700",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  summaryCard: {
    minWidth: 130,
    flexGrow: 1,
    borderRadius: 12,
    backgroundColor: "rgba(20, 56, 99, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.22)",
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  summaryNumber: {
    color: "#f4f8ff",
    fontSize: 26,
    fontWeight: "700",
  },
  summaryLabel: {
    color: "#b7c8e8",
    fontSize: 12,
    marginTop: 2,
  },
  actionsWrap: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.20)",
    backgroundColor: "rgba(13, 32, 53, 0.88)",
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
});
