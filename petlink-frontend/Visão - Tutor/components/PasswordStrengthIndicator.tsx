import { StyleSheet, Text, View } from "react-native";
import { getPasswordStrength } from "../src/utils/passwordStrength";

export function PasswordStrengthIndicator({ password }: { password: string }) {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const activeBars = strength === "forte" ? 3 : strength === "media" ? 2 : 1;
  const color = strength === "forte" ? "#42D392" : strength === "media" ? "#F6C453" : "#FF7A90";
  const label = strength === "media" ? "média" : strength;

  return (
    <View accessibilityLiveRegion="polite" style={styles.container}>
      <View style={styles.bars}>
        {[1, 2, 3].map((bar) => <View key={bar} style={[styles.bar, bar <= activeBars && { backgroundColor: color }]} />)}
      </View>
      <Text style={[styles.label, { color }]}>Senha {label}</Text>
      {strength === "fraca" && <Text style={styles.help}>Use 8+ caracteres e 3 tipos: maiúscula, minúscula, número ou símbolo.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  bars: { flexDirection: "row", gap: 5 },
  bar: { flex: 1, height: 5, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.25)" },
  label: { marginTop: 5, fontSize: 12, fontWeight: "800", textTransform: "capitalize" },
  help: { color: "rgba(255,255,255,0.78)", fontSize: 11, lineHeight: 15, marginTop: 3 },
});
