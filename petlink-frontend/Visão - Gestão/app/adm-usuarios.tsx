import { deleteUsuario, getUsuarios, Usuario } from "@/src/api/usuarioService";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import { AuthContext } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ListaUsuarios() {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadUsuarios = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    const result = await getUsuarios(token);

    if (result.ok && Array.isArray(result?.data?.data)) {
      setUsuarios(result.data.data);
    } else {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível carregar usuários."));
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  async function confirmDelete() {
    if (!token || confirmDeleteId === null) {
      setConfirmDeleteId(null);
      return;
    }

    const result = await deleteUsuario(confirmDeleteId, token);
    setConfirmDeleteId(null);

    if (!result.ok) {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível remover o usuário."));
      return;
    }

    setUsuarios((prev) => prev.filter((item) => item.id !== confirmDeleteId));
  }

  return (
    <LinearGradient colors={["#071321", "#0d1b2a", "#12263f"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.badge}>Módulo Administrativo</Text>
            <Text style={styles.title}>Usuários/Tutores</Text>
            <Text style={styles.subtitle}>Acompanhe contas e dados cadastrais dos tutores.</Text>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={16} color="#dbe9ff" />
            <Text style={styles.backButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          {loading ? (
            <Text style={styles.infoText}>Carregando usuários...</Text>
          ) : usuarios.length === 0 ? (
            <Text style={styles.infoText}>Nenhum usuário cadastrado.</Text>
          ) : (
            usuarios.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemMain}>
                  <Text style={styles.itemTitle}>{item.nome}</Text>
                  <Text style={styles.itemSubtitle}>{item.email}</Text>
                  <Text style={styles.itemSubtitle}>Telefone: {item.telefone}</Text>
                  <Text style={styles.itemAddress}>
                    Endereço: {item.rua}, {item.numero} - {item.bairro}, {item.cidade}/{item.uf} - CEP {item.cep}
                  </Text>
                </View>

                <TouchableOpacity style={[styles.iconAction, styles.iconDanger]} onPress={() => setConfirmDeleteId(item.id)}>
                  <Ionicons name="trash-outline" size={17} color="#ffd5d5" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        transparent
        visible={confirmDeleteId !== null}
        animationType="fade"
        onRequestClose={() => setConfirmDeleteId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmar exclusão</Text>
            <Text style={styles.confirmText}>Tem certeza que deseja excluir este usuário?</Text>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setConfirmDeleteId(null)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalDelete} onPress={confirmDelete}>
                <Text style={styles.modalDeleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 1080,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 22,
    gap: 14,
  },
  headerCard: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.30)",
    backgroundColor: "rgba(19, 37, 59, 0.9)",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerTextWrap: { flex: 1 },
  badge: { color: "#9fc0f6", fontSize: 12, fontWeight: "700", marginBottom: 3 },
  title: { color: "#eff5ff", fontSize: 30, fontWeight: "700", lineHeight: 34 },
  subtitle: { color: "#b7c8e8", marginTop: 4, fontSize: 14, lineHeight: 20 },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(26, 72, 130, 0.6)",
    borderWidth: 1,
    borderColor: "rgba(138, 180, 248, 0.4)",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  backButtonText: { color: "#dbe9ff", fontWeight: "700", fontSize: 13 },
  listCard: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.20)",
    backgroundColor: "rgba(13, 32, 53, 0.88)",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  infoText: { color: "#b7c8e8", fontSize: 14 },
  itemCard: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.20)",
    backgroundColor: "rgba(20, 56, 99, 0.55)",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  itemMain: { flex: 1, gap: 3 },
  itemTitle: { color: "#f4f8ff", fontSize: 15, fontWeight: "700" },
  itemSubtitle: { color: "#b7c8e8", fontSize: 12 },
  itemAddress: { color: "#9fc0f6", fontSize: 12, lineHeight: 18, marginTop: 2 },
  iconAction: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(38, 92, 167, 0.45)",
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
  },
  iconDanger: {
    backgroundColor: "rgba(155, 45, 45, 0.38)",
    borderColor: "rgba(255, 138, 138, 0.25)",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.30)",
    backgroundColor: "#0f253e",
    padding: 16,
    gap: 10,
  },
  modalTitle: { color: "#edf4ff", fontSize: 18, fontWeight: "700", marginBottom: 2 },
  confirmText: { color: "#c6d7f2", fontSize: 14, lineHeight: 20 },
  modalActions: { marginTop: 4, flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalCancel: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.35)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "rgba(20, 56, 99, 0.35)",
  },
  modalCancelText: { color: "#dbe9ff", fontWeight: "700" },
  modalDelete: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#c73939",
  },
  modalDeleteText: { color: "#fff", fontWeight: "700" },
});
