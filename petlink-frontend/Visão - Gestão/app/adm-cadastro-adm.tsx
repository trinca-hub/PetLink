import {
  Administrador,
  createAdministrador,
  deleteAdministrador,
  getAdministradores,
} from "@/src/api/administradorService";
import ListControls, { FilterGroup, SortState, TextFilter } from "@/components/ListControls";
import SearchableSelectModal, { SelectOption } from "@/components/SearchableSelectModal";
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
  senha: string;
  status: string;
};

const INITIAL_FORM: FormState = {
  nome: "",
  email: "",
  senha: "",
  status: "1",
};

export default function CadastroAdministrador() {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [administradores, setAdministradores] = useState<Administrador[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [formError, setFormError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [openStatusSelect, setOpenStatusSelect] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ field: "", direction: "none" });
  const [nomeFilter, setNomeFilter] = useState("");
  const [emailFilter, setEmailFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");

  const statusOptions: SelectOption[] = [
    { value: "1", label: "Ativo", subtitle: "Status = 1" },
    { value: "2", label: "Desativado", subtitle: "Status = 2" },
  ];

  const selectedStatus = useMemo(
    () => statusOptions.find((option) => option.value === form.status),
    [form.status]
  );

  const filteredAdministradores = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedNome = nomeFilter.trim().toLowerCase();
    const normalizedEmail = emailFilter.trim().toLowerCase();

    const result = administradores.filter((item) => {
      const searchable = [item.nome, item.email, String(item.id), String(item.status)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const status = String(item.status ?? 1);

      return (
        (!normalizedSearch || searchable.includes(normalizedSearch)) &&
        (!normalizedNome || (item.nome || "").toLowerCase().includes(normalizedNome)) &&
        (!normalizedEmail || (item.email || "").toLowerCase().includes(normalizedEmail)) &&
        (statusFilter === "todos" || status === statusFilter)
      );
    });

    if (sort.direction === "none") return result;

    return [...result].sort((a, b) => {
      const direction = sort.direction === "asc" ? 1 : -1;
      if (sort.field === "id") return (a.id - b.id) * direction;
      if (sort.field === "email") return (a.email || "").localeCompare(b.email || "") * direction;
      return (a.nome || "").localeCompare(b.nome || "") * direction;
    });
  }, [administradores, search, nomeFilter, emailFilter, statusFilter, sort]);

  const textFilters = useMemo<TextFilter[]>(
    () => [
      { label: "Nome", value: nomeFilter, onChange: setNomeFilter, placeholder: "Pesquisar por nome" },
      { label: "E-mail", value: emailFilter, onChange: setEmailFilter, placeholder: "Pesquisar por e-mail" },
    ],
    [nomeFilter, emailFilter]
  );

  const filters = useMemo<FilterGroup[]>(
    () => [
      {
        label: "Status",
        value: statusFilter,
        onChange: setStatusFilter,
        options: [
          { label: "Todos", value: "todos" },
          { label: "Ativo", value: "1" },
          { label: "Desativado", value: "2" },
        ],
      },
    ],
    [statusFilter]
  );

  const loadAdministradores = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    const result = await getAdministradores(token);

    if (result.ok && Array.isArray(result?.data?.data)) {
      setAdministradores(result.data.data);
    } else {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível carregar administradores."));
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadAdministradores();
  }, [loadAdministradores]);

  function resetForm() {
    setForm(INITIAL_FORM);
    setFormError("");
  }

  async function handleSave() {
    if (!token) return;

    setFormError("");

    if (!form.nome.trim() || !form.email.trim() || !form.senha.trim()) {
      setFormError("Preencha nome, e-mail e senha.");
      return;
    }

    setSaving(true);

    const payload = {
      nome: form.nome.trim(),
      email: form.email.trim().toLowerCase(),
      senha: form.senha,
      status: Number(form.status || 1),
    };

    const result = await createAdministrador(payload, token);
    setSaving(false);

    if (!result.ok) {
      setFormError(getApiErrorMessage(result?.data, "Não foi possível cadastrar administrador."));
      return;
    }

    resetForm();
    await loadAdministradores();
  }

  async function confirmDelete() {
    if (!token || confirmDeleteId === null) {
      setConfirmDeleteId(null);
      return;
    }

    const result = await deleteAdministrador(confirmDeleteId, token);
    setConfirmDeleteId(null);

    if (!result.ok) {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível remover administrador."));
      return;
    }

    setAdministradores((prev) => prev.filter((item) => item.id !== confirmDeleteId));
  }

  return (
    <LinearGradient colors={["#071321", "#0d1b2a", "#12263f"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.badge}>Módulo Administrativo</Text>
            <Text style={styles.title}>Novo Administrador</Text>
            <Text style={styles.subtitle}>Cadastre e gerencie perfis administrativos do sistema.</Text>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={16} color="#dbe9ff" />
            <Text style={styles.backButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>Cadastro</Text>

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
            placeholder="Senha"
            placeholderTextColor="#98abc9"
            secureTextEntry
            value={form.senha}
            onChangeText={(value) => setForm((prev) => ({ ...prev, senha: value }))}
          />

          <TouchableOpacity style={styles.selectButton} onPress={() => setOpenStatusSelect(true)}>
            <Text style={styles.selectLabel}>Status</Text>
            <Text style={styles.selectValue}>{selectedStatus?.label || "Selecionar status"}</Text>
          </TouchableOpacity>

          {!!formError && <Text style={styles.errorText}>{formError}</Text>}

          <TouchableOpacity style={styles.primaryButton} onPress={handleSave} disabled={saving}>
            <Ionicons name="person-add-outline" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>{saving ? "Salvando..." : "Cadastrar administrador"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>Administradores cadastrados</Text>

          <ListControls
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar por administrador, e-mail..."
            sort={sort}
            onSortChange={setSort}
            sortFields={[
              { label: "Nome", value: "nome", type: "text" },
              { label: "E-mail", value: "email", type: "text" },
              { label: "ID", value: "id", type: "number" },
            ]}
            textFilters={textFilters}
            filters={filters}
            resultCount={filteredAdministradores.length}
            totalCount={administradores.length}
          />

          {loading ? (
            <Text style={styles.infoText}>Carregando administradores...</Text>
          ) : filteredAdministradores.length === 0 ? (
            <Text style={styles.infoText}>Nenhum administrador encontrado.</Text>
          ) : (
            filteredAdministradores.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemMain}>
                  <Text style={styles.itemTitle}>{item.nome}</Text>
                  <Text style={styles.itemSubtitle}>{item.email}</Text>
                  <Text style={styles.itemStatus}>Status: {Number(item.status) === 1 ? "Ativo" : "Desativado"}</Text>
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
            <Text style={styles.confirmText}>Tem certeza que deseja excluir este administrador?</Text>

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

      <SearchableSelectModal
        visible={openStatusSelect}
        title="Selecionar status"
        options={statusOptions}
        onClose={() => setOpenStatusSelect(false)}
        onSelect={(option) => setForm((prev) => ({ ...prev, status: option.value }))}
      />
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
  sectionTitle: { color: "#edf4ff", fontSize: 16, fontWeight: "700" },
  formCard: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.20)",
    backgroundColor: "rgba(13, 32, 53, 0.88)",
    borderRadius: 16,
    padding: 14,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#eaf2ff",
    backgroundColor: "rgba(20, 56, 99, 0.45)",
  },
  selectButton: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "rgba(20, 56, 99, 0.45)",
    gap: 2,
  },
  selectLabel: { color: "#9fc0f6", fontSize: 11, fontWeight: "700" },
  selectValue: { color: "#eaf2ff", fontSize: 13 },
  primaryButton: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#1d67e0",
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  errorText: { color: "#ffb0b0", fontSize: 13, lineHeight: 18, marginTop: 2 },
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
  itemStatus: { color: "#9fc0f6", fontSize: 12, marginTop: 2 },
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
