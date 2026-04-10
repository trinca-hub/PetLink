import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeGestao() {
  const router = useRouter();

  const acessos = [
    {
      label: "Logar como Administrador",
      icon: "shield-checkmark-outline" as const,
      route: "/login-adm",
    },
    {
      label: "Logar como Veterinário",
      icon: "medkit-outline" as const,
      route: "/login-vet",
    },
    {
      label: "Logar como Funcionário",
      icon: "briefcase-outline" as const,
      route: "/login-func",
    },
  ];

  return (
    <LinearGradient colors={["#071321", "#0d1b2a", "#12263f"]} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.badge}>
            <Ionicons name="sparkles-outline" size={20} color="#8fbaff" />
            <Text style={styles.badgeText}>PetLink Gestão</Text>
          </View>

          <Text style={styles.title}>Acesso Gestão</Text>
          <Text style={styles.subtitle}>
            Selecione o perfil para autenticar com segurança no painel administrativo.
          </Text>
        </View>

        {acessos.map((item) => (
          <TouchableOpacity key={item.route} style={styles.button} onPress={() => router.push(item.route)}>
            <View style={styles.buttonLeft}>
              <Ionicons name={item.icon} size={20} color="#dce9ff" />
              <Text style={styles.buttonText}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#c4d9ff" />
          </TouchableOpacity>
        ))}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1b2a",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    gap: 12,
    backgroundColor: "rgba(19, 37, 59, 0.88)",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(138, 180, 248, 0.28)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  header: {
    marginBottom: 8,
    gap: 8,
  },
  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(23, 63, 105, 0.85)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: "#c9dcff",
    fontWeight: "700",
    fontSize: 12,
  },
  title: {
    color: "#f5f9ff",
    fontSize: 34,
    fontWeight: "700",
    lineHeight: 38,
  },
  subtitle: {
    color: "#b7c8e8",
    fontSize: 14,
    lineHeight: 20,
  },
  button: {
    backgroundColor: "rgba(13, 110, 253, 0.22)",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(143, 186, 255, 0.38)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexShrink: 1,
  },
  buttonText: {
    color: "#e6f0ff",
    fontWeight: "700",
    fontSize: 15,
  },
});
