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
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon as any} size={22} color="#d3e4ff" />
      </View>

      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <Ionicons name="chevron-forward" size={20} color="#9ec0f5" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(143, 186, 255, 0.30)",
    backgroundColor: "rgba(15, 46, 86, 0.62)",
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(38, 92, 167, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: {
    flex: 1,
  },
  title: {
    color: "#ecf3ff",
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    color: "#adc4e6",
    fontSize: 12,
    marginTop: 2,
  },
});
