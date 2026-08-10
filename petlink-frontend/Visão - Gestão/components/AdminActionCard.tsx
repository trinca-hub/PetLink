import { managementTheme } from "@/constants/managementTheme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AdminActionCardProps = {
  title: string;
  subtitle: string;
  icon: string;
  onPress: () => void;
};

export default function AdminActionCard({ title, subtitle, icon, onPress }: AdminActionCardProps) {
  return (
    <TouchableOpacity accessibilityRole="button" style={styles.card} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon as any} size={19} color={managementTheme.colors.textStrong} />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.arrowWrap}>
        <Ionicons name="arrow-forward-outline" size={16} color={managementTheme.colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minWidth: 230,
    flex: 1,
    borderRadius: managementTheme.radii.md,
    borderWidth: 1,
    borderColor: managementTheme.colors.border,
    backgroundColor: "rgba(15, 23, 42, 0.76)",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: managementTheme.radii.sm,
    backgroundColor: managementTheme.colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.20)",
  },
  textWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: managementTheme.colors.text,
    fontSize: 14,
    fontWeight: "800",
  },
  subtitle: {
    color: managementTheme.colors.textSubtle,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  arrowWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(148, 163, 184, 0.08)",
  },
});
