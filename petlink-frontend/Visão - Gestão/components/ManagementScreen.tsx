import { managementStyles, managementTheme } from "@/constants/managementTheme";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type HeaderAction = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

type ManagementScreenProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  action?: HeaderAction;
  children: ReactNode;
};

export function ManagementScreen({ eyebrow, title, subtitle, action, children }: ManagementScreenProps) {
  return (
    <LinearGradient colors={managementTheme.gradients.app} style={managementStyles.screen}>
      <ScrollView contentContainerStyle={managementStyles.content}>
        <View style={managementStyles.topBar}>
          <View style={managementStyles.brandWrap}>
            <View style={managementStyles.brandMark}>
              <Ionicons name="pulse-outline" size={18} color="#fff" />
            </View>
            <View>
              <Text style={managementStyles.brandTitle}>PetLink Gestão</Text>
              <Text style={managementStyles.brandSubtitle}>Operação, clínica e marketplace</Text>
            </View>
          </View>

          <View style={styles.statusWrap}>
            <View style={styles.liveDot} />
            <Text style={styles.statusText}>Ambiente local</Text>
          </View>
        </View>

        <View style={managementStyles.headerCard}>
          <View style={managementStyles.headerTextWrap}>
            <Text style={managementStyles.eyebrow}>{eyebrow}</Text>
            <Text style={managementStyles.title}>{title}</Text>
            <Text style={managementStyles.subtitle}>{subtitle}</Text>
          </View>

          {action && (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={action.label}
              style={managementStyles.secondaryButton}
              onPress={action.onPress}
            >
              <Ionicons name={action.icon} size={18} color={managementTheme.colors.text} />
              <Text style={managementStyles.secondaryButtonText}>{action.label}</Text>
            </TouchableOpacity>
          )}
        </View>

        {children}
      </ScrollView>
    </LinearGradient>
  );
}

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function EmptyState({ title, description, icon = "file-tray-outline" }: EmptyStateProps) {
  return (
    <View style={managementStyles.emptyState}>
      <Ionicons name={icon} size={24} color={managementTheme.colors.accent} />
      <Text style={managementStyles.emptyTitle}>{title}</Text>
      {!!description && <Text style={managementStyles.emptyDescription}>{description}</Text>}
    </View>
  );
}

type StatusPillProps = {
  label: string;
  tone?: "success" | "warning" | "danger";
};

export function StatusPill({ label, tone = "success" }: StatusPillProps) {
  const toneStyle =
    tone === "danger"
      ? managementStyles.statusDanger
      : tone === "warning"
        ? managementStyles.statusWarning
        : managementStyles.statusSuccess;

  return <Text style={[managementStyles.statusPill, toneStyle]}>{label}</Text>;
}

const styles = StyleSheet.create({
  statusWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: "rgba(15, 23, 42, 0.82)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
    backgroundColor: managementTheme.colors.success,
  },
  statusText: {
    color: managementTheme.colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
  },
});
