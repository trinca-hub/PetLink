import { EmptyState, ManagementScreen } from "@/components/ManagementScreen";
import { managementStyles } from "@/constants/managementTheme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

type AdminBaseScreenProps = {
  title: string;
  description: string;
  icon: string;
};

export default function AdminBaseScreen({ title, description, icon }: AdminBaseScreenProps) {
  const router = useRouter();

  return (
    <ManagementScreen
      eyebrow="Módulo Administrativo"
      title={title}
      subtitle={description}
      action={{ label: "Dashboard", icon: "arrow-back-outline", onPress: () => router.back() }}
    >
      <View style={managementStyles.panel}>
        <EmptyState
          icon={icon as any}
          title="Estrutura pronta para operação"
          description="Este módulo já segue a base visual de gestão e pode receber a rotina completa do CRUD."
        />

        <TouchableOpacity accessibilityRole="button" style={managementStyles.primaryButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back-outline" size={18} color="#fff" />
          <Text style={managementStyles.buttonText}>Voltar ao dashboard</Text>
        </TouchableOpacity>
      </View>
    </ManagementScreen>
  );
}
