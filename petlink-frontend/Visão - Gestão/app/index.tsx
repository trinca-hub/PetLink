import { managementTheme } from "@/constants/managementTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";

export default function HomeGestao() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isCompact = width < 760;

  const acessos = [
    {
      label: "Administrador",
      description: "Indicadores, cadastros e governança da operação.",
      icon: "shield-checkmark-outline" as const,
      route: "/login-adm" as const,
    },
    {
      label: "Veterinário",
      description: "Agenda clínica, solicitações e serviços.",
      icon: "medkit-outline" as const,
      route: "/login-vet" as const,
    },
    {
      label: "Funcionário",
      description: "Rotinas de estoque, pets, pedidos e serviços.",
      icon: "briefcase-outline" as const,
      route: "/login-func" as const,
    },
  ];

  return (
    <LinearGradient colors={managementTheme.gradients.app} style={styles.container}>
      <View style={[styles.shell, isCompact && styles.shellCompact]}>
        <View style={[styles.brandPanel, isCompact && styles.brandPanelCompact]}>
          <View style={styles.brandMark}>
            <Ionicons name="pulse-outline" size={22} color="#fff" />
          </View>
          <Text style={styles.brandTitle}>PetLink Gestão</Text>
          <Text style={styles.brandSubtitle}>
            Portal interno para administrar loja, clínica e marketplace com segurança.
          </Text>

          <View style={styles.signalRow}>
            <View style={styles.signalPill}>
              <View style={styles.signalDot} />
              <Text style={styles.signalText}>Ambiente local</Text>
            </View>
            <View style={styles.signalPill}>
              <Ionicons name="lock-closed-outline" size={13} color={managementTheme.colors.textMuted} />
              <Text style={styles.signalText}>Acesso restrito</Text>
            </View>
          </View>
        </View>

        <View style={styles.accessPanel}>
          <Text style={styles.panelEyebrow}>Selecione o perfil</Text>
          <Text style={styles.panelTitle}>Entrar no painel</Text>
          <Text style={styles.panelText}>Cada área carrega somente os módulos permitidos para o perfil autenticado.</Text>

          <View style={styles.accessList}>
            {acessos.map((item) => (
              <TouchableOpacity
                key={item.route}
                accessibilityRole="button"
                style={styles.accessCard}
                onPress={() => router.push(item.route)}
              >
                <View style={styles.accessIcon}>
                  <Ionicons name={item.icon} size={20} color={managementTheme.colors.textStrong} />
                </View>

                <View style={styles.accessCopy}>
                  <Text style={styles.accessTitle}>{item.label}</Text>
                  <Text style={styles.accessDescription}>{item.description}</Text>
                </View>

                <Ionicons name="arrow-forward-outline" size={17} color={managementTheme.colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: managementTheme.colors.background,
    justifyContent: "center",
    padding: 24,
  },
  shell: {
    width: "100%",
    maxWidth: 980,
    alignSelf: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: managementTheme.colors.borderStrong,
    borderRadius: managementTheme.radii.xl,
    backgroundColor: "rgba(15, 23, 42, 0.82)",
    overflow: "hidden",
  },
  shellCompact: {
    maxWidth: 480,
    flexDirection: "column",
  },
  brandPanel: {
    flex: 1,
    minHeight: 430,
    padding: 28,
    justifyContent: "space-between",
    backgroundColor: "rgba(8, 13, 22, 0.72)",
  },
  brandPanelCompact: {
    minHeight: 240,
  },
  brandMark: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: managementTheme.colors.primary,
    marginBottom: 18,
  },
  brandTitle: {
    color: managementTheme.colors.textStrong,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: "900",
    maxWidth: 340,
  },
  brandSubtitle: {
    color: managementTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    maxWidth: 380,
  },
  signalRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 22,
  },
  signalPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  signalDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: managementTheme.colors.success,
  },
  signalText: {
    color: managementTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
  accessPanel: {
    flex: 1,
    padding: 28,
    justifyContent: "center",
    gap: 10,
  },
  panelEyebrow: {
    color: managementTheme.colors.accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  panelTitle: {
    color: managementTheme.colors.textStrong,
    fontSize: 26,
    fontWeight: "900",
  },
  panelText: {
    color: managementTheme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 8,
  },
  accessList: {
    gap: 10,
  },
  accessCard: {
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: "rgba(30, 41, 59, 0.55)",
    borderRadius: managementTheme.radii.md,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  accessIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: managementTheme.colors.primarySoft,
  },
  accessCopy: {
    flex: 1,
    minWidth: 0,
  },
  accessTitle: {
    color: managementTheme.colors.text,
    fontSize: 14,
    fontWeight: "900",
  },
  accessDescription: {
    color: managementTheme.colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
});
