import { AuthContext } from "@/src/context/AuthContext";
import ListControls, { FilterGroup, SortState, TextFilter } from "@/components/ListControls";
import { EmptyState } from "@/components/ManagementScreen";
import { managementTheme } from "@/constants/managementTheme";
import SearchableSelectModal, { SelectOption } from "@/components/SearchableSelectModal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import { createAdminServico, deleteAdminServico, getAdminServicos, Servico, ServicoPayload, updateAdminServico } from "@/src/api/servicoService";
import { getAdminPets, Pet } from "@/src/api/petService";
import { parseDecimalInput, parseIntInput } from "@/src/utils/numberUtils";

type FormState = {
  dataServico: string;
  descricao: string;
  tipo: string;
  valor: string;
  petId: string;
};

const INITIAL_FORM: FormState = {
  dataServico: "",
  descricao: "",
  tipo: "1",
  valor: "",
  petId: "",
};

export default function AdmServicos() {
  const router = useRouter();
  const { token, perfil } = useContext(AuthContext);
  const canCreate = perfil === "adm" || perfil === "vet";
  const canEditDelete = perfil === "adm";
  const readOnly = perfil === "func";

  const [servicos, setServicos] = useState<Servico[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [openPetSelect, setOpenPetSelect] = useState(false);
  const [openTipoSelect, setOpenTipoSelect] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ field: "", direction: "none" });
  const [descricaoFilter, setDescricaoFilter] = useState("");
  const [petFilter, setPetFilter] = useState("");
  const [tipoFilter, setTipoFilter] = useState("todos");

  const petById = useMemo(() => {
    const map: Record<number, Pet> = {};
    pets.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [pets]);

  const petOptions = useMemo<SelectOption[]>(
    () =>
      pets.map((pet) => ({
        value: String(pet.id),
        label: pet.nome,
        subtitle: `ID ${pet.id} • Tutor ${pet.usuarioId}`,
      })),
    [pets]
  );

  const tipoOptions = useMemo<SelectOption[]>(
    () => [
      { value: "1", label: "Consulta", subtitle: "Tipo = 1" },
      { value: "2", label: "Banho", subtitle: "Tipo = 2" },
      { value: "3", label: "Tosa", subtitle: "Tipo = 3" },
    ],
    []
  );

  const selectedPet = useMemo(
    () => pets.find((pet) => pet.id === parseIntInput(form.petId)),
    [pets, form.petId]
  );

  const selectedTipo = useMemo(
    () => tipoOptions.find((tipo) => tipo.value === form.tipo),
    [form.tipo, tipoOptions]
  );

  const filteredServicos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedDescricao = descricaoFilter.trim().toLowerCase();
    const normalizedPet = petFilter.trim().toLowerCase();

    const result = servicos.filter((servico) => {
      const petNome = petById[servico.petId]?.nome || "";
      const tipoLabel = servico.tipo === 1 ? "Consulta" : servico.tipo === 2 ? "Banho" : "Tosa";
      const searchable = [
        String(servico.id),
        servico.descricao,
        tipoLabel,
        String(servico.valor),
        petNome,
        String(servico.petId),
        servico.dataServico,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!normalizedSearch || searchable.includes(normalizedSearch)) &&
        (!normalizedDescricao || (servico.descricao || "").toLowerCase().includes(normalizedDescricao)) &&
        (!normalizedPet || petNome.toLowerCase().includes(normalizedPet) || String(servico.petId).includes(normalizedPet)) &&
        (tipoFilter === "todos" || String(servico.tipo) === tipoFilter)
      );
    });

    if (sort.direction === "none") return result;

    return [...result].sort((a, b) => {
      const direction = sort.direction === "asc" ? 1 : -1;
      if (sort.field === "id") return (a.id - b.id) * direction;
      if (sort.field === "valor") return (Number(a.valor || 0) - Number(b.valor || 0)) * direction;
      if (sort.field === "data") {
        return ((new Date(a.dataServico).getTime() || 0) - (new Date(b.dataServico).getTime() || 0)) * direction;
      }
      if (sort.field === "pet") return (petById[a.petId]?.nome || "").localeCompare(petById[b.petId]?.nome || "") * direction;
      return (a.descricao || "").localeCompare(b.descricao || "") * direction;
    });
  }, [servicos, petById, search, descricaoFilter, petFilter, tipoFilter, sort]);

  const textFilters = useMemo<TextFilter[]>(
    () => [
      { label: "Descricao", value: descricaoFilter, onChange: setDescricaoFilter, placeholder: "Pesquisar por descricao" },
      { label: "Pet", value: petFilter, onChange: setPetFilter, placeholder: "Pesquisar por pet" },
    ],
    [descricaoFilter, petFilter]
  );

  const filters = useMemo<FilterGroup[]>(
    () => [
      {
        label: "Tipo",
        value: tipoFilter,
        onChange: setTipoFilter,
        options: [
          { label: "Todos", value: "todos" },
          { label: "Consulta", value: "1" },
          { label: "Banho", value: "2" },
          { label: "Tosa", value: "3" },
        ],
      },
    ],
    [tipoFilter]
  );

  const loadData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    const [servicosResult, petsResult] = await Promise.all([
      getAdminServicos(token),
      getAdminPets(token),
    ]);

    if (servicosResult.ok && Array.isArray(servicosResult?.data?.data)) {
      setServicos(servicosResult.data.data);
    } else {
      Alert.alert("Erro", getApiErrorMessage(servicosResult?.data, "Não foi possível carregar serviços."));
    }

    if (petsResult.ok && Array.isArray(petsResult?.data?.data)) {
      setPets(petsResult.data.data);
    } else {
      Alert.alert("Erro", getApiErrorMessage(petsResult?.data, "Não foi possível carregar pets."));
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openCreateModal() {
    if (!canCreate) return;

    setEditId(null);
    setForm(INITIAL_FORM);
    setFormError("");
    setOpenModal(true);
  }

  function openEditModal(servico: Servico) {
    if (!canEditDelete) return;

    setEditId(servico.id);
    setForm({
      dataServico: servico.dataServico ? new Date(servico.dataServico).toISOString().slice(0, 10) : "",
      descricao: servico.descricao || "",
      tipo: String(servico.tipo ?? 1),
      valor: String(servico.valor ?? ""),
      petId: String(servico.petId ?? ""),
    });
    setFormError("");
    setOpenModal(true);
  }

  function closeModal() {
    setOpenModal(false);
    setEditId(null);
    setForm(INITIAL_FORM);
    setFormError("");
  }

  async function handleSave() {
    if (!token) return;
    if (editId && !canEditDelete) return;
    if (!editId && !canCreate) return;

    if (!form.dataServico || !form.descricao.trim() || !form.tipo || !form.valor || !form.petId) {
      setFormError("Preencha todos os campos obrigatórios.");
      return;
    }

    const tipo = parseIntInput(form.tipo);
    const valor = parseDecimalInput(form.valor);
    const petId = parseIntInput(form.petId);

    if (Number.isNaN(tipo) || tipo < 1 || tipo > 3) {
      setFormError("Tipo inválido. Use 1, 2 ou 3.");
      return;
    }

    if (Number.isNaN(valor) || valor <= 0) {
      setFormError("Valor inválido.");
      return;
    }

    if (Number.isNaN(petId) || petId <= 0 || !petById[petId]) {
      setFormError("Pet inválido.");
      return;
    }

    setSaving(true);
    setFormError("");

    const payload: ServicoPayload = {
      dataServico: new Date(`${form.dataServico}T00:00:00.000Z`).toISOString(),
      descricao: form.descricao.trim(),
      tipo,
      valor,
      petId,
    };

    const result = editId
      ? await updateAdminServico(editId, payload, token)
      : await createAdminServico(payload, token);

    setSaving(false);

    if (!result.ok) {
      setFormError(getApiErrorMessage(result?.data, "Não foi possível salvar serviço."));
      return;
    }

    closeModal();
    await loadData();
  }

  async function confirmDelete() {
    if (!token || confirmDeleteId === null || !canEditDelete) return;

    const result = await deleteAdminServico(confirmDeleteId, token);
    setConfirmDeleteId(null);

    if (!result.ok) {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível excluir serviço."));
      return;
    }

    setServicos((prev) => prev.filter((s) => s.id !== confirmDeleteId));
  }

  return (
    <LinearGradient colors={managementTheme.gradients.app} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.badge}>{perfil === "vet" ? "Módulo Veterinário" : "Módulo Administrativo"}</Text>
            <Text style={styles.title}>Serviços</Text>
            <Text style={styles.subtitle}>
              {readOnly
                ? "Visualização de serviços vinculados aos pets."
                : perfil === "vet"
                  ? "Cadastro de serviços vinculados aos pets."
                  : "CRUD completo de serviços com vínculo em pets."}
            </Text>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={16} color="#dbe9ff" />
            <Text style={styles.backButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        {canCreate && (
          <TouchableOpacity style={styles.primaryButton} onPress={openCreateModal}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Novo serviço</Text>
          </TouchableOpacity>
        )}

        <ListControls
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por servico, pet, tipo..."
          sort={sort}
          onSortChange={setSort}
          sortFields={[
            { label: "Descricao", value: "descricao", type: "text" },
            { label: "Pet", value: "pet", type: "text" },
            { label: "Data", value: "data", type: "date" },
            { label: "Valor", value: "valor", type: "number" },
            { label: "ID", value: "id", type: "number" },
          ]}
          textFilters={textFilters}
          filters={filters}
          resultCount={filteredServicos.length}
          totalCount={servicos.length}
        />

        <View style={styles.listCard}>
          {loading ? (
            <EmptyState icon="hourglass-outline" title="Carregando serviços..." />
          ) : filteredServicos.length === 0 ? (
            <EmptyState title="Nenhum serviço encontrado" description="Ajuste a busca ou cadastre um novo serviço." />
          ) : (
            filteredServicos.map((servico) => (
              <View key={servico.id} style={styles.itemCard}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={styles.itemTitle}>Serviço #{servico.id}</Text>
                  <Text style={styles.itemSubtitle}>Descrição: {servico.descricao}</Text>
                  <Text style={styles.itemSubtitle}>Tipo: {servico.tipo === 1 ? "Consulta" : servico.tipo === 2 ? "Banho" : "Tosa"}</Text>
                  <Text style={styles.itemSubtitle}>Valor: R$ {Number(servico.valor || 0).toFixed(2)}</Text>
                  <Text style={styles.itemSubtitle}>Pet: {petById[servico.petId]?.nome || servico.petId}</Text>
                  <Text style={styles.itemSubtitle}>Data: {new Date(servico.dataServico).toLocaleDateString("pt-BR")}</Text>
                </View>

                {canEditDelete && (
                  <View style={styles.itemActions}>
                    <TouchableOpacity style={styles.iconAction} onPress={() => openEditModal(servico)}>
                      <Ionicons name="create-outline" size={16} color="#dce9ff" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconAction, styles.iconDanger]} onPress={() => setConfirmDeleteId(servico.id)}>
                      <Ionicons name="trash-outline" size={16} color="#ffd5d5" />
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal transparent visible={openModal && canCreate} animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editId ? "Editar serviço" : "Novo serviço"}</Text>
            <TextInput style={styles.input} placeholder="Data (AAAA-MM-DD)" placeholderTextColor="#98abc9" value={form.dataServico} onChangeText={(v) => setForm((p) => ({ ...p, dataServico: v }))} />
            <TextInput style={styles.input} placeholder="Descrição" placeholderTextColor="#98abc9" value={form.descricao} onChangeText={(v) => setForm((p) => ({ ...p, descricao: v }))} />
            <TouchableOpacity style={styles.selectButton} onPress={() => setOpenTipoSelect(true)}>
              <Text style={styles.selectLabel}>Tipo de serviço</Text>
              <Text style={styles.selectValue}>{selectedTipo?.label || "Selecionar tipo"}</Text>
            </TouchableOpacity>
            <TextInput style={styles.input} placeholder="Valor" placeholderTextColor="#98abc9" keyboardType="decimal-pad" value={form.valor} onChangeText={(v) => setForm((p) => ({ ...p, valor: v }))} />
            <TouchableOpacity style={styles.selectButton} onPress={() => setOpenPetSelect(true)}>
              <Text style={styles.selectLabel}>Pet</Text>
              <Text style={styles.selectValue}>{selectedPet ? `${selectedPet.nome} (${selectedPet.id})` : "Selecionar pet"}</Text>
            </TouchableOpacity>

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

      <Modal transparent visible={confirmDeleteId !== null && canEditDelete} animationType="fade" onRequestClose={() => setConfirmDeleteId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmar exclusão</Text>
            <Text style={styles.infoText}>Deseja remover este serviço?</Text>
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
        visible={openPetSelect}
        title="Selecionar pet"
        options={petOptions}
        onClose={() => setOpenPetSelect(false)}
        onSelect={(option) => setForm((prev) => ({ ...prev, petId: option.value }))}
      />

      <SearchableSelectModal
        visible={openTipoSelect}
        title="Selecionar tipo de serviço"
        options={tipoOptions}
        onClose={() => setOpenTipoSelect(false)}
        onSelect={(option) => setForm((prev) => ({ ...prev, tipo: option.value }))}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { width: "100%", maxWidth: 1080, alignSelf: "center", paddingHorizontal: 22, paddingVertical: 22, gap: 14 },
  headerCard: { borderWidth: 1, borderColor: "rgba(138,180,248,0.30)", backgroundColor: "rgba(19, 37, 59, 0.9)", borderRadius: 18, padding: 18, flexDirection: "row", justifyContent: "space-between", gap: 12 },
  badge: { color: "#9fc0f6", fontSize: 12, fontWeight: "700", marginBottom: 3 },
  title: { color: "#eff5ff", fontSize: 30, fontWeight: "700", lineHeight: 34 },
  subtitle: { color: "#b7c8e8", marginTop: 4, fontSize: 14, lineHeight: 20 },
  backButton: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(26, 72, 130, 0.6)", borderWidth: 1, borderColor: "rgba(138, 180, 248, 0.4)", borderRadius: 12, paddingVertical: 8, paddingHorizontal: 10 },
  backButtonText: { color: "#dbe9ff", fontWeight: "700", fontSize: 13 },
  primaryButton: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1d67e0", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, alignSelf: "flex-start" },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  listCard: { borderWidth: 1, borderColor: "rgba(138,180,248,0.20)", backgroundColor: "rgba(13, 32, 53, 0.88)", borderRadius: 16, padding: 14, gap: 10 },
  infoText: { color: "#b7c8e8", fontSize: 14 },
  itemCard: { borderWidth: 1, borderColor: "rgba(138,180,248,0.20)", backgroundColor: "rgba(20, 56, 99, 0.55)", borderRadius: 12, padding: 12, flexDirection: "row", justifyContent: "space-between", gap: 10 },
  itemTitle: { color: "#f4f8ff", fontSize: 15, fontWeight: "700" },
  itemSubtitle: { color: "#b7c8e8", fontSize: 12 },
  itemActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconAction: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(38, 92, 167, 0.45)", borderWidth: 1, borderColor: "rgba(138,180,248,0.25)" },
  iconDanger: { backgroundColor: "rgba(155, 45, 45, 0.38)", borderColor: "rgba(255, 138, 138, 0.25)" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 18 },
  modalCard: { width: "100%", maxWidth: 560, alignSelf: "center", borderRadius: 16, borderWidth: 1, borderColor: "rgba(138,180,248,0.30)", backgroundColor: "#0f253e", padding: 16, gap: 10 },
  modalTitle: { color: "#edf4ff", fontSize: 18, fontWeight: "700", marginBottom: 2 },
  input: { borderWidth: 1, borderColor: "rgba(138,180,248,0.25)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: "#eaf2ff", backgroundColor: "rgba(20, 56, 99, 0.45)" },
  selectButton: { borderWidth: 1, borderColor: "rgba(138,180,248,0.25)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "rgba(20, 56, 99, 0.45)", gap: 2 },
  selectLabel: { color: "#9fc0f6", fontSize: 11, fontWeight: "700" },
  selectValue: { color: "#eaf2ff", fontSize: 13 },
  errorText: { color: "#ffb0b0", fontSize: 13, lineHeight: 18 },
  modalActions: { marginTop: 4, flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalCancel: { borderRadius: 10, borderWidth: 1, borderColor: "rgba(138,180,248,0.35)", paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "rgba(20, 56, 99, 0.35)" },
  modalCancelText: { color: "#dbe9ff", fontWeight: "700" },
  modalSave: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#1d67e0" },
  modalSaveText: { color: "#fff", fontWeight: "700" },
  modalDelete: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#c73939" },
  modalDeleteText: { color: "#fff", fontWeight: "700" },
});
