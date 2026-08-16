import { StyleSheet, Text, View } from "react-native";
import { passwordStrength } from "@/src/utils/passwordStrength";

export default function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const strength = passwordStrength(password);
  const amount = strength === "forte" ? 3 : strength === "média" ? 2 : 1;
  const color = strength === "forte" ? "#34d399" : strength === "média" ? "#fbbf24" : "#fb7185";
  return <View><View style={styles.bars}>{[1, 2, 3].map((item) => <View key={item} style={[styles.bar, item <= amount && { backgroundColor: color }]} />)}</View><Text style={[styles.text, { color }]}>Senha {strength}</Text>{strength === "fraca" && <Text style={styles.hint}>Use 8+ caracteres e 3 tipos: maiúscula, minúscula, número ou símbolo.</Text>}</View>;
}
const styles = StyleSheet.create({ bars: { flexDirection: "row", gap: 5, marginTop: 7 }, bar: { height: 4, flex: 1, borderRadius: 99, backgroundColor: "#334155" }, text: { fontSize: 11, fontWeight: "800", marginTop: 4 }, hint: { color: "#94a3b8", fontSize: 11, lineHeight: 15, marginTop: 2 } });
