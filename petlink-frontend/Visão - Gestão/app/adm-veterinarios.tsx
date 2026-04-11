import {
  createVeterinario,
  deleteVeterinario,
  getVeterinarios,
  updateVeterinario,
  Veterinario,
} from "@/src/api/veterinarioService";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import { AuthContext } from "@/src/context/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FormState = {
  nome: string;
  email: string;
  crmv: string;
  salario: string;
  status: string;
  senha: string;
};

const INITIAL_FORM: FormState = {
  nome: "",
  email: "",
  crmv: "",
  salario: "",
  status: "1",
  senha: "",
};

export default function ListaVeterinarios() {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [veterinarios, setVeterinarios] = useState<Veterinario[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [formError, setFormError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const isEdit = useMemo(() => editId !== null, [editId]);

  const loadVeterinarios = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    const result = await getVeterinarios(token);

    if (result.ok && Array.isArray(result?.data?.data)) {
      setVeterinarios(result.data.data);
    } else {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível carregar veterinários."));
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadVeterinarios();
  }, [loadVeterinarios]);

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditId(null);
    setFormError("");
  }

  function openCreateModal() {
    resetForm();
    setOpenModal(true);
  }

  function openEditModal(item: Veterinario) {
    setEditId(item.id);
    setForm({
      nome: item.nome || "",
      email: item.email || "",
      crmv: item.crmv || "",
      salario: String(item.salario ?? ""),
      status: String(item.status ?? 1),
      senha: "",
    });
    setOpenModal(true);
  }

  function closeModal() {
    setOpenModal(false);
    resetForm();
  }

  async function handleSave() {
    if (!token) return;

    setFormError("");

    if (!form.nome.trim() || !form.email.trim() || !form.crmv.trim() || !form.salario.trim()) {
      setFormError("Preencha nome, e-mail, CRMV e salário.");
      return;
    }

    const salario = Number(form.salario.replace(".", "").replace(",", "."));
    if (Number.isNaN(salario) || salario <= 0) {
      setFormError("Salário inválido. Informe um valor maior que zero.");
      return;
    }

    if (!isEdit && !form.senha.trim()) {
      setFormError("Informe uma senha para o novo veterinário.");
      return;
    }

    setSaving(true);

    const payload = {
      id: editId ?? 0,
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      crmv: form.crmv.trim(),
      salario,
      status: Number(form.status || 1),
      senha: isEdit ? "manter_senha" : form.senha,
    };

    const result = isEdit && editId
      ? await updateVeterinario(editId, payload, token)
      : await createVeterinario(payload, token);

    setSaving(false);

    if (!result.ok) {
      setFormError(getApiErrorMessage(result?.data, "Não foi possível salvar o veterinário."));
      return;
    }

    closeModal();
    await loadVeterinarios();
  }

  async function confirmDelete() {
    if (!token || confirmDeleteId === null) {
      setConfirmDeleteId(null);
      return;
    }

    const result = await deleteVeterinario(confirmDeleteId, token);
    setConfirmDeleteId(null);

    if (!result.ok) {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível remover o veterinário."));
      return;
    }

    setVeterinarios((prev) => prev.filter((item) => item.id !== confirmDeleteId));
  }

  return (
    <LinearGradient colors={["#071321", "#0d1b2a", "#12263f"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.badge}>Módulo Administrativo</Text>
            <Text style={styles.title}>Veterinários</Text>
            <Text style={styles.subtitle}>Gerencie veterinários ativos e suas credenciais.</Text>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={16} color="#dbe9ff" />
            <Text style={styles.backButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={openCreateModal}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Novo veterinário</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          {loading ? (
            <Text style={styles.infoText}>Carregando veterinários...</Text>
          ) : veterinarios.length === 0 ? (
            <Text style={styles.infoText}>Nenhum veterinário cadastrado.</Text>
          ) : (
            veterinarios.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemMain}>
                  <Text style={styles.itemTitle}>{item.nome}</Text>
                  <Text style={styles.itemSubtitle}>{item.email}</Text>
                  <Text style={styles.itemSubtitle}>CRMV: {item.crmv}</Text>
                  <Text style={styles.itemSalary}>Salário: R$ {Number(item.salario || 0).toFixed(2)}</Text>
                  <Text style={styles.itemStatus}>Status: {Number(item.status) === 1 ? "Ativo" : "Desativado"}</Text>
                </View>

                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.iconAction} onPress={() => openEditModal(item)}>
                    <Ionicons name="create-outline" size={17} color="#dce9ff" />
                  </TouchableOpacity>

                  <TouchableOpacity style={[styles.iconAction, styles.iconDanger]} onPress={() => setConfirmDeleteId(item.id)}>
                    <Ionicons name="trash-outline" size={17} color="#ffd5d5" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal transparent visible={openModal} animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isEdit ? "Editar veterinário" : "Novo veterinário"}</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor="#98abc9"
              value={form.nome}
              onChangeText={(value) => setForm((prev) => ({ ...prev, nome: value }))}
            />

            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#98abc9"
              autoCapitalize="none"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
            />

            <TextInput
              style={styles.input}
              placeholder="CRMV"
              placeholderTextColor="#98abc9"
              value={form.crmv}
              onChangeText={(value) => setForm((prev) => ({ ...prev, crmv: value }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Salário"
              placeholderTextColor="#98abc9"
              keyboardType="numeric"
              value={form.salario}
              onChangeText={(value) => setForm((prev) => ({ ...prev, salario: value }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Status (1 = Ativo, 2 = Desativado)"
              placeholderTextColor="#98abc9"
              keyboardType="numeric"
              value={form.status}
              onChangeText={(value) => setForm((prev) => ({ ...prev, status: value }))}
            />

            {!isEdit && (
              <TextInput
                style={styles.input}
                placeholder="Senha"
                placeholderTextColor="#98abc9"
                secureTextEntry
                value={form.senha}
                onChangeText={(value) => setForm((prev) => ({ ...prev, senha: value }))}
              />
            )}

            {!!formError && <Text style={styles.errorText}>{formError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={closeModal}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSave} onPress={handleSave} disabled={saving}>
                <Text style={styles.modalSaveText}>{saving ? "Salvando..." : "Salvar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        visible={confirmDeleteId !== null}
        animationType="fade"
        onRequestClose={() => setConfirmDeleteId(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmar exclusão</Text>
            <Text style={styles.confirmText}>Tem certeza que deseja excluir este veterinário?</Text>

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
  actionsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#1d67e0",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
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
  itemSalary: { color: "#dce9ff", fontSize: 12, marginTop: 2 },
  itemStatus: { color: "#9fc0f6", fontSize: 12, marginTop: 2 },
  itemActions: { flexDirection: "row", alignItems: "center", gap: 8 },
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
  input: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#eaf2ff",
    backgroundColor: "rgba(20, 56, 99, 0.45)",
  },
  errorText: { color: "#ffb0b0", fontSize: 13, lineHeight: 18, marginTop: 2 },
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
  modalSave: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#1d67e0",
  },
  modalSaveText: { color: "#fff", fontWeight: "700" },
  modalDelete: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#c73939",
  },
  modalDeleteText: { color: "#fff", fontWeight: "700" },
});
