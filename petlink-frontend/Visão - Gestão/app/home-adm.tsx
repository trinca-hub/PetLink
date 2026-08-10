import AdminActionCard from "@/components/AdminActionCard";
import { ManagementScreen } from "@/components/ManagementScreen";
import { ADMIN_MENU } from "@/constants/adminMenu";
import { managementStyles, managementTheme } from "@/constants/managementTheme";
import { useAdminSummary } from "@/hooks/useAdminSummary";
import { AuthContext } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeAdm() {
  const router = useRouter();
  const { token, user, logout } = useContext(AuthContext);
  const { summary, loading, error, refresh } = useAdminSummary(token);

  async function handleLogout() {
    await logout();
    router.replace("/");
  }

  const equipeTotal = summary.funcionarios + summary.veterinarios;
  const kpis = [
    {
      label: "Usuários",
      value: summary.usuarios,
      icon: "people-outline",
      detail: "Tutores cadastrados",
      tone: managementTheme.colors.primarySoft,
    },
    {
      label: "Produtos",
      value: summary.produtos,
      icon: "cube-outline",
      detail: "Itens no catálogo",
      tone: managementTheme.colors.successSoft,
    },
    {
      label: "Anúncios",
      value: summary.anuncios,
      icon: "megaphone-outline",
      detail: "Publicações monitoradas",
      tone: managementTheme.colors.warningSoft,
    },
    {
      label: "Equipe",
      value: equipeTotal,
      icon: "briefcase-outline",
      detail: `${summary.funcionarios} funcionários, ${summary.veterinarios} veterinários`,
      tone: "rgba(56, 189, 248, 0.16)",
    },
  ];

  return (
    <ManagementScreen
      eyebrow="Administração"
      title="Centro de comando"
      subtitle={`Olá, ${user?.nome || "Administrador"}. Acompanhe a operação, revise indicadores e acesse os módulos críticos do PetLink.`}
      action={{ label: "Sair", icon: "log-out-outline", onPress: handleLogout }}
    >
      <View style={styles.heroPanel}>
        <View style={styles.heroText}>
          <Text style={styles.heroLabel}>Visão executiva</Text>
          <Text style={styles.heroTitle}>Operação consolidada em tempo real</Text>
          <Text style={styles.heroDescription}>
            Use os indicadores para priorizar cadastros, estoque, anúncios e equipe antes de entrar nos módulos.
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          style={styles.refreshButton}
          onPress={refresh}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={managementTheme.colors.textStrong} />
          ) : (
            <Ionicons name="refresh-outline" size={17} color={managementTheme.colors.textStrong} />
          )}
          <Text style={styles.refreshText}>{loading ? "Atualizando" : "Atualizar dados"}</Text>
        </TouchableOpacity>
      </View>

      {!!error && <Text style={managementStyles.errorText}>{error}</Text>}

      <View style={styles.kpiGrid}>
        {kpis.map((item) => (
          <View key={item.label} style={styles.kpiCard}>
            <View style={[styles.kpiIcon, { backgroundColor: item.tone }]}>
              <Ionicons name={item.icon as any} size={18} color={managementTheme.colors.textStrong} />
            </View>
            <Text style={styles.kpiNumber}>{item.value}</Text>
            <Text style={styles.kpiLabel}>{item.label}</Text>
            <Text style={styles.kpiDetail}>{item.detail}</Text>
          </View>
        ))}
      </View>

      <View style={styles.twoColumns}>
        <View style={[managementStyles.panel, styles.priorityPanel]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Prioridades da gestão</Text>
            <Text style={styles.sectionHint}>Rotina diária</Text>
          </View>

          {[
            { icon: "receipt-outline", title: "Pedidos", text: "Acompanhar criação e cancelamentos com impacto em estoque." },
            { icon: "cube-outline", title: "Estoque", text: "Revisar disponibilidade antes de campanhas e novos pedidos." },
            { icon: "megaphone-outline", title: "Anúncios", text: "Moderar publicações e manter o marketplace saudável." },
          ].map((item) => (
            <View key={item.title} style={styles.priorityItem}>
              <Ionicons name={item.icon as any} size={18} color={managementTheme.colors.accent} />
              <View style={styles.priorityCopy}>
                <Text style={styles.priorityTitle}>{item.title}</Text>
                <Text style={styles.priorityText}>{item.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[managementStyles.panel, styles.healthPanel]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Saúde da base</Text>
            <Text style={styles.sectionHint}>Cadastros</Text>
          </View>

          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Equipe administrativa</Text>
            <Text style={styles.healthValue}>{summary.funcionarios}</Text>
          </View>
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Veterinários ativos</Text>
            <Text style={styles.healthValue}>{summary.veterinarios}</Text>
          </View>
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Base tutor/produto</Text>
            <Text style={styles.healthValue}>{summary.usuarios + summary.produtos}</Text>
          </View>
        </View>
      </View>

      <View style={managementStyles.panel}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Módulos administrativos</Text>
          <Text style={styles.sectionHint}>Acesso rápido</Text>
        </View>

        <View style={styles.actionsGrid}>
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
      </View>
    </ManagementScreen>
  );
}

const styles = StyleSheet.create({
  heroPanel: {
    borderWidth: 1,
    borderColor: managementTheme.colors.borderStrong,
    backgroundColor: "rgba(15, 23, 42, 0.78)",
    borderRadius: managementTheme.radii.xl,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  heroText: {
    flex: 1,
    gap: 4,
  },
  heroLabel: {
    color: managementTheme.colors.accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  heroTitle: {
    color: managementTheme.colors.textStrong,
    fontSize: 20,
    fontWeight: "900",
  },
  heroDescription: {
    color: managementTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 680,
  },
  refreshButton: {
    ...managementStyles.primaryButton,
    minHeight: 42,
  },
  refreshText: {
    color: managementTheme.colors.textStrong,
    fontWeight: "900",
    fontSize: 13,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  kpiCard: {
    minWidth: 190,
    flex: 1,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: "rgba(15, 23, 42, 0.82)",
    borderRadius: managementTheme.radii.lg,
    padding: 16,
  },
  kpiIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  kpiNumber: {
    color: managementTheme.colors.textStrong,
    fontSize: 30,
    fontWeight: "900",
  },
  kpiLabel: {
    color: managementTheme.colors.text,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 1,
  },
  kpiDetail: {
    color: managementTheme.colors.textSubtle,
    fontSize: 12,
    marginTop: 5,
    lineHeight: 17,
  },
  twoColumns: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  priorityPanel: {
    flex: 1.5,
    minWidth: 320,
  },
  healthPanel: {
    flex: 1,
    minWidth: 280,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
  priorityItem: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: managementTheme.colors.border,
    paddingTop: 12,
  },
  priorityCopy: {
    flex: 1,
    gap: 2,
  },
  priorityTitle: {
    color: managementTheme.colors.text,
    fontSize: 13,
    fontWeight: "900",
  },
  priorityText: {
    color: managementTheme.colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
  },
  healthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: managementTheme.colors.border,
    paddingTop: 12,
  },
  healthLabel: {
    color: managementTheme.colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  healthValue: {
    color: managementTheme.colors.textStrong,
    fontSize: 18,
    fontWeight: "900",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
});
