import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type AdminBaseScreenProps = {
  title: string;
  description: string;
  icon: string;
};

export default function AdminBaseScreen({ title, description, icon }: AdminBaseScreenProps) {
  const router = useRouter();

  return (
    <LinearGradient colors={["#071321", "#0d1b2a", "#12263f"]} style={styles.container}>
      <View style={styles.card}>
        <Ionicons name={icon as any} size={34} color="#dce9ff" />
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <Text style={styles.status}>Estrutura inicial pronta para CRUD completo.</Text>

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Voltar ao Dashboard</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    alignSelf: "center",
    borderRadius: 20,
    padding: 24,
    backgroundColor: "rgba(19, 37, 59, 0.9)",
    borderWidth: 1,
    borderColor: "rgba(138, 180, 248, 0.3)",
    gap: 10,
  },
  title: {
    color: "#f5f9ff",
    fontSize: 28,
    fontWeight: "700",
  },
  description: {
    color: "#b7c8e8",
    fontSize: 14,
    lineHeight: 20,
  },
  status: {
    marginTop: 6,
    color: "#9ed6b3",
    fontSize: 13,
    fontWeight: "600",
  },
  button: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: "#1b6cff",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});
