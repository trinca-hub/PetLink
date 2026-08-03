import AdminActionCard from "@/components/AdminActionCard";
import { ManagementScreen } from "@/components/ManagementScreen";
import { managementStyles, managementTheme } from "@/constants/managementTheme";
import { AuthContext } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function HomeVet() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  return (
    <ManagementScreen
      eyebrow="Atendimento clínico"
      title="Painel Veterinário"
      subtitle={`Olá, ${user?.nome || "Veterinário"}. Organize agenda, acompanhe solicitações e mantenha os serviços clínicos atualizados.`}
      action={{ label: "Sair", icon: "log-out-outline", onPress: handleLogout }}
    >
      <View style={styles.overviewGrid}>
        {[
          { label: "Agenda", value: "Slots", icon: "calendar-outline", text: "Disponibilidade de atendimento" },
          { label: "Solicitações", value: "Fila", icon: "chatbubbles-outline", text: "Pedidos de consulta para acompanhar" },
          { label: "Serviços", value: "Catálogo", icon: "construct-outline", text: "Procedimentos vinculados aos pets" },
        ].map((item) => (
          <View key={item.label} style={styles.focusCard}>
            <View style={styles.focusIcon}>
              <Ionicons name={item.icon as any} size={18} color={managementTheme.colors.textStrong} />
            </View>
            <Text style={styles.focusValue}>{item.value}</Text>
            <Text style={styles.focusLabel}>{item.label}</Text>
            <Text style={styles.focusText}>{item.text}</Text>
          </View>
        ))}
      </View>

      <View style={managementStyles.panel}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rotina veterinária</Text>
          <Text style={styles.sectionHint}>Acesso rápido</Text>
        </View>

        <View style={styles.actionsGrid}>
          <AdminActionCard
            title="Minha Agenda"
            subtitle="Configurar disponibilidade e consultar slots"
            icon="calendar-outline"
            onPress={() => router.push("/vet-agenda")}
          />

          <AdminActionCard
            title="Solicitações de Consulta"
            subtitle="Enviar e acompanhar solicitações clínicas"
            icon="chatbubbles-outline"
            onPress={() => router.push("/vet-solicitacoes")}
          />

          <AdminActionCard
            title="Criar Serviços"
            subtitle="Cadastrar serviços vinculados aos pets"
            icon="construct-outline"
            onPress={() => router.push("/adm-servicos")}
          />
        </View>
      </View>
    </ManagementScreen>
  );
}

const styles = StyleSheet.create({
  overviewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  focusCard: {
    minWidth: 220,
    flex: 1,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: "rgba(15, 23, 42, 0.82)",
    borderRadius: managementTheme.radii.lg,
    padding: 16,
  },
  focusIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: managementTheme.colors.successSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  focusValue: {
    color: managementTheme.colors.textStrong,
    fontSize: 22,
    fontWeight: "900",
  },
  focusLabel: {
    color: managementTheme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 2,
  },
  focusText: {
    color: managementTheme.colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
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
