import AdminActionCard from "@/components/AdminActionCard";
import { ManagementScreen } from "@/components/ManagementScreen";
import { FUNC_MENU } from "@/constants/funcMenu";
import { managementStyles, managementTheme } from "@/constants/managementTheme";
import { AuthContext } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HomeFunc() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <ManagementScreen
      eyebrow="Operação"
      title="Painel Operacional"
      subtitle={`Olá, ${user?.nome || "Funcionário"}. Acesse os módulos do dia a dia com foco em estoque, pets, pedidos e serviços.`}
      action={{ label: "Sair", icon: "log-out-outline", onPress: handleLogout }}
    >
      <View style={styles.workflowPanel}>
        {[
          { icon: "cube-outline", title: "Estoque organizado", text: "Atualize itens antes de gerar pedidos." },
          { icon: "paw-outline", title: "Pets vinculados", text: "Mantenha os cadastros consistentes." },
          { icon: "receipt-outline", title: "Pedidos controlados", text: "Crie e cancele pedidos com rastreio de itens." },
        ].map((item) => (
          <View key={item.title} style={styles.workflowItem}>
            <Ionicons name={item.icon as any} size={18} color={managementTheme.colors.accent} />
            <View style={styles.workflowCopy}>
              <Text style={styles.workflowTitle}>{item.title}</Text>
              <Text style={styles.workflowText}>{item.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={managementStyles.panel}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Módulos operacionais</Text>
          <Text style={styles.sectionHint}>Permissões do perfil</Text>
        </View>

        <View style={styles.actionsGrid}>
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
      </View>
    </ManagementScreen>
  );
}

const styles = StyleSheet.create({
  workflowPanel: {
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: "rgba(15, 23, 42, 0.82)",
    borderRadius: managementTheme.radii.lg,
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  workflowItem: {
    minWidth: 230,
    flex: 1,
    flexDirection: "row",
    gap: 11,
    alignItems: "flex-start",
    backgroundColor: "rgba(30, 41, 59, 0.42)",
    borderRadius: managementTheme.radii.md,
    padding: 12,
  },
  workflowCopy: {
    flex: 1,
    gap: 3,
  },
  workflowTitle: {
    color: managementTheme.colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  workflowText: {
    color: managementTheme.colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sectionTitle: {
    color: managementTheme.colors.text,
    fontSize: 16,
    fontWeight: "900",
  },
  sectionHint: {
    color: managementTheme.colors.textSubtle,
    fontSize: 12,
    fontWeight: "800",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
