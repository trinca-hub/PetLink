import {
  createAdminPet,
  deleteAdminPet,
  getAdminPets,
  Pet,
  PetPayload,
  updateAdminPet,
} from "@/src/api/petService";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import ListControls, { FilterGroup, SortState, TextFilter } from "@/components/ListControls";
import SearchableSelectModal, { SelectOption } from "@/components/SearchableSelectModal";
import { AuthContext } from "@/src/context/AuthContext";
import { getUsuarios, Usuario } from "@/src/api/usuarioService";
import { isLikelyHttpUrl, validateImageUrl } from "@/src/utils/imageUrlUtils";
import { parseDecimalInput, parseIntInput } from "@/src/utils/numberUtils";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
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
  raca: string;
  sexo: string;
  rga: string;
  idade: string;
  peso: string;
  castrado: boolean;
  foto: string;
  tipoPet: string;
  usuarioId: string;
};

const INITIAL_FORM: FormState = {
  nome: "",
  raca: "",
  sexo: "",
  rga: "",
  idade: "",
  peso: "",
  castrado: false,
  foto: "",
  tipoPet: "1",
  usuarioId: "",
};

type ImageStatus = "idle" | "loading" | "ok" | "error";

function normalizeTipoPetValue(tipoPet: Pet["tipoPet"] | string | null | undefined) {
  if (tipoPet === 1 || tipoPet === "1" || tipoPet === "GATO") return "1";
  if (tipoPet === 2 || tipoPet === "2" || tipoPet === "CACHORRO") return "2";
  return "1";
}

function getTipoPetLabel(tipoPet: Pet["tipoPet"] | string | null | undefined) {
  return normalizeTipoPetValue(tipoPet) === "1" ? "Gato" : "Cachorro";
}

export default function AdmPets() {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [pets, setPets] = useState<Pet[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const [imageStatus, setImageStatus] = useState<ImageStatus>("idle");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [openTutorSelect, setOpenTutorSelect] = useState(false);
  const [openTipoSelect, setOpenTipoSelect] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ field: "", direction: "none" });
  const [sexoFilter, setSexoFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [castradoFilter, setCastradoFilter] = useState("todos");
  const [nomeFilter, setNomeFilter] = useState("");
  const [tutorFilter, setTutorFilter] = useState("");

  const selectedUser = useMemo(
    () => usuarios.find((u) => u.id === parseIntInput(form.usuarioId)),
    [usuarios, form.usuarioId]
  );

  const selectedTipoPet = useMemo(
    () => (form.tipoPet === "1" ? "Gato" : form.tipoPet === "2" ? "Cachorro" : "Não selecionado"),
    [form.tipoPet]
  );

  const tutorOptions = useMemo<SelectOption[]>(
    () =>
      usuarios.map((usuario) => ({
        value: String(usuario.id),
        label: usuario.nome,
        subtitle: `ID ${usuario.id} • ${usuario.email}`,
      })),
    [usuarios]
  );

  const tipoPetOptions: SelectOption[] = [
    { value: "1", label: "Gato", subtitle: "TipoPet = 1" },
    { value: "2", label: "Cachorro", subtitle: "TipoPet = 2" },
  ];

  const filteredPets = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const normalizedNomeFilter = nomeFilter.trim().toLowerCase();
    const normalizedTutorFilter = tutorFilter.trim().toLowerCase();

    const result = pets
      .filter((pet) => {
        const tutor = usuarios.find((usuario) => usuario.id === pet.usuarioId);
        const searchable = [
          pet.nome,
          pet.raca,
          pet.sexo,
          pet.rga,
          pet.idade,
          String(pet.usuarioId),
          tutor?.nome,
          getTipoPetLabel(pet.tipoPet),
          pet.castrado ? "castrado" : "nao castrado",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const sexo = (pet.sexo || "").toLowerCase();
        const tipo = normalizeTipoPetValue(pet.tipoPet);
        const nome = (pet.nome || "").toLowerCase();
        const tutorNome = (tutor?.nome || "").toLowerCase();

        return (
          (!normalizedSearch || searchable.includes(normalizedSearch)) &&
          (!normalizedNomeFilter || nome.includes(normalizedNomeFilter)) &&
          (!normalizedTutorFilter || tutorNome.includes(normalizedTutorFilter)) &&
          (sexoFilter === "todos" || sexo.includes(sexoFilter)) &&
          (tipoFilter === "todos" || tipo === tipoFilter) &&
          (castradoFilter === "todos" ||
            (castradoFilter === "sim" ? pet.castrado : !pet.castrado))
        );
      });

    if (sort.direction === "none") return result;

    return [...result].sort((a, b) => {
      const direction = sort.direction === "asc" ? 1 : -1;

      if (sort.field === "id") return (a.id - b.id) * direction;
      if (sort.field === "tutor") {
        const tutorA = usuarios.find((usuario) => usuario.id === a.usuarioId)?.nome || "";
        const tutorB = usuarios.find((usuario) => usuario.id === b.usuarioId)?.nome || "";
        return tutorA.localeCompare(tutorB) * direction;
      }
      if (sort.field === "tipo") return getTipoPetLabel(a.tipoPet).localeCompare(getTipoPetLabel(b.tipoPet)) * direction;
      return (a.nome || "").localeCompare(b.nome || "") * direction;
    });
  }, [pets, usuarios, search, nomeFilter, tutorFilter, sexoFilter, tipoFilter, castradoFilter, sort]);

  const petTextFilters = useMemo<TextFilter[]>(
    () => [
      { label: "Nome", value: nomeFilter, onChange: setNomeFilter, placeholder: "Pesquisar por nome do pet" },
      { label: "Tutor", value: tutorFilter, onChange: setTutorFilter, placeholder: "Pesquisar por nome do tutor" },
    ],
    [nomeFilter, tutorFilter]
  );

  const petFilters = useMemo<FilterGroup[]>(
    () => [
      {
        label: "Sexo",
        value: sexoFilter,
        onChange: setSexoFilter,
        options: [
          { label: "Todos", value: "todos" },
          { label: "Machos", value: "macho" },
          { label: "Fêmeas", value: "fêmea" },
        ],
      },
      {
        label: "Tipo",
        value: tipoFilter,
        onChange: setTipoFilter,
        options: [
          { label: "Todos", value: "todos" },
          { label: "Gatos", value: "1" },
          { label: "Cachorros", value: "2" },
        ],
      },
      {
        label: "Castrado",
        value: castradoFilter,
        onChange: setCastradoFilter,
        options: [
          { label: "Todos", value: "todos" },
          { label: "Sim", value: "sim" },
          { label: "Não", value: "nao" },
        ],
      },
    ],
    [sexoFilter, tipoFilter, castradoFilter]
  );

  const isEdit = editId !== null;

  const loadData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    const [petsResult, usuariosResult] = await Promise.all([
      getAdminPets(token),
      getUsuarios(token),
    ]);

    if (petsResult.ok && Array.isArray(petsResult?.data?.data)) {
      setPets(petsResult.data.data);
    } else {
      Alert.alert("Erro", getApiErrorMessage(petsResult?.data, "Não foi possível carregar pets."));
    }

    if (usuariosResult.ok && Array.isArray(usuariosResult?.data?.data)) {
      setUsuarios(usuariosResult.data.data);
    } else {
      Alert.alert("Erro", getApiErrorMessage(usuariosResult?.data, "Não foi possível carregar usuários."));
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function resetForm() {
    setForm(INITIAL_FORM);
    setEditId(null);
    setFormError("");
    setImageStatus("idle");
  }

  function openCreateModal() {
    resetForm();
    setOpenModal(true);
  }

  function openEditModal(pet: Pet) {
    setEditId(pet.id);
    setForm({
      nome: pet.nome || "",
      raca: pet.raca || "",
      sexo: pet.sexo || "",
      rga: pet.rga || "",
      idade: pet.idade || "",
      peso: String(pet.peso ?? ""),
      castrado: !!pet.castrado,
      foto: pet.foto || "",
      tipoPet: normalizeTipoPetValue(pet.tipoPet),
      usuarioId: String(pet.usuarioId ?? ""),
    });
    setFormError("");
    setImageStatus(pet.foto && isLikelyHttpUrl(pet.foto) ? "ok" : "idle");
    setOpenModal(true);
  }

  function closeModal() {
    setOpenModal(false);
    resetForm();
  }

  async function handleValidateImageUrl(url: string) {
    const trimmed = url.trim();
    if (!trimmed) {
      setImageStatus("idle");
      return;
    }

    setImageStatus("loading");
    const result = await validateImageUrl(trimmed);
    setImageStatus(result.valid ? "ok" : "error");
  }

  function askSaveWithoutPhoto(): Promise<boolean> {
    return new Promise((resolve) => {
      Alert.alert(
        "Imagem inválida",
        "A URL da imagem não passou na validação. Deseja salvar este pet sem foto?",
        [
          { text: "Cancelar", style: "cancel", onPress: () => resolve(false) },
          { text: "Salvar sem foto", onPress: () => resolve(true) },
        ]
      );
    });
  }

  async function handleSave() {
    if (!token) return;

    setFormError("");

    if (
      !form.nome.trim() ||
      !form.raca.trim() ||
      !form.sexo.trim() ||
      !form.rga.trim() ||
      !form.idade.trim() ||
      !form.peso.trim() ||
      !form.usuarioId.trim()
    ) {
      setFormError("Preencha todos os atributos obrigatórios do pet.");
      return;
    }

    if (form.rga.trim().length > 7) {
      setFormError("RGA deve ter no máximo 7 caracteres.");
      return;
    }

    if (form.foto.trim() && imageStatus !== "ok") {
      setFormError("A URL da imagem é obrigatória para preview válido antes de salvar.");
      return;
    }

    const peso = parseDecimalInput(form.peso);
    const tipoPet = parseIntInput(form.tipoPet);
    const usuarioId = parseIntInput(form.usuarioId);

    if (Number.isNaN(peso) || peso <= 0) {
      setFormError("Peso inválido.");
      return;
    }

    if (Number.isNaN(tipoPet) || (tipoPet !== 1 && tipoPet !== 2)) {
      setFormError("Tipo de pet inválido. Use 1 (Gato) ou 2 (Cachorro).");
      return;
    }

    if (Number.isNaN(usuarioId) || usuarioId <= 0) {
      setFormError("Selecione um tutor válido.");
      return;
    }

    let foto = form.foto.trim();
    if (foto && imageStatus === "error") {
      const shouldSaveWithoutPhoto = await askSaveWithoutPhoto();
      if (!shouldSaveWithoutPhoto) {
        return;
      }

      foto = "";
    }

    const payload: PetPayload = {
      nome: form.nome.trim(),
      raca: form.raca.trim(),
      sexo: form.sexo.trim(),
      rga: form.rga.trim(),
      idade: form.idade.trim(),
      peso,
      castrado: form.castrado,
      foto: foto || undefined,
      tipoPet,
      usuarioId,
    };

    setSaving(true);

    const result = isEdit && editId
      ? await updateAdminPet(editId, payload, token)
      : await createAdminPet(payload, token);

    setSaving(false);

    if (!result.ok) {
      setFormError(getApiErrorMessage(result?.data, "Não foi possível salvar o pet."));
      return;
    }

    closeModal();
    await loadData();
  }

  async function confirmDelete() {
    if (!token || confirmDeleteId === null) return;

    const result = await deleteAdminPet(confirmDeleteId, token);
    setConfirmDeleteId(null);

    if (!result.ok) {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível excluir o pet."));
      return;
    }

    setPets((prev) => prev.filter((p) => p.id !== confirmDeleteId));
  }

  return (
    <LinearGradient colors={["#071321", "#0d1b2a", "#12263f"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.badge}>Módulo Administrativo</Text>
            <Text style={styles.title}>Pets</Text>
            <Text style={styles.subtitle}>CRUD completo com vínculo de tutor existente.</Text>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={16} color="#dbe9ff" />
            <Text style={styles.backButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={openCreateModal}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.primaryButtonText}>Novo pet</Text>
        </TouchableOpacity>

        <ListControls
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por nome, raça, sexo, tutor..."
          sort={sort}
          onSortChange={setSort}
          sortFields={[
            { label: "Nome", value: "nome", type: "text" },
            { label: "ID", value: "id", type: "number" },
            { label: "Tutor", value: "tutor", type: "text" },
            { label: "Tipo", value: "tipo", type: "text" },
          ]}
          textFilters={petTextFilters}
          filters={petFilters}
          resultCount={filteredPets.length}
          totalCount={pets.length}
        />

        <View style={styles.listCard}>
          {loading ? (
            <Text style={styles.infoText}>Carregando pets...</Text>
          ) : filteredPets.length === 0 ? (
            <Text style={styles.infoText}>Nenhum pet encontrado.</Text>
          ) : (
            filteredPets.map((pet) => (
              <View key={pet.id} style={styles.itemCard}>
                <View style={{ flexDirection: "row", gap: 12, flex: 1 }}>
                  {!!pet.foto ? (
                    <Image source={{ uri: pet.foto }} style={styles.itemImage} />
                  ) : (
                    <View style={[styles.itemImage, styles.itemImageFallback]}>
                      <Ionicons name="paw-outline" size={22} color="#8fb1e0" />
                    </View>
                  )}

                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.itemTitle}>{pet.nome}</Text>
                    <Text style={styles.itemSubtitle}>{pet.raca} • {pet.sexo} • {pet.idade}</Text>
                    <Text style={styles.itemSubtitle}>Tutor ID: {pet.usuarioId}</Text>
                    <Text style={styles.itemSubtitle}>Peso: {pet.peso}kg • Tipo: {getTipoPetLabel(pet.tipoPet)}</Text>
                    <Text style={styles.itemSubtitle}>Castrado: {pet.castrado ? "Sim" : "Não"}</Text>
                  </View>
                </View>

                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.iconAction} onPress={() => openEditModal(pet)}>
                    <Ionicons name="create-outline" size={16} color="#dce9ff" />
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconAction, styles.iconDanger]} onPress={() => setConfirmDeleteId(pet.id)}>
                    <Ionicons name="trash-outline" size={16} color="#ffd5d5" />
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
            <Text style={styles.modalTitle}>{isEdit ? "Editar pet" : "Novo pet"}</Text>

            <TextInput style={styles.input} placeholder="Nome" placeholderTextColor="#98abc9" value={form.nome} onChangeText={(v) => setForm((p) => ({ ...p, nome: v }))} />
            <TextInput style={styles.input} placeholder="Raça" placeholderTextColor="#98abc9" value={form.raca} onChangeText={(v) => setForm((p) => ({ ...p, raca: v }))} />
            <TextInput style={styles.input} placeholder="Sexo" placeholderTextColor="#98abc9" value={form.sexo} onChangeText={(v) => setForm((p) => ({ ...p, sexo: v }))} />
            <TextInput style={styles.input} placeholder="RGA" placeholderTextColor="#98abc9" value={form.rga} onChangeText={(v) => setForm((p) => ({ ...p, rga: v }))} />
            <TextInput style={styles.input} placeholder="Idade (ex.: 2 anos)" placeholderTextColor="#98abc9" value={form.idade} onChangeText={(v) => setForm((p) => ({ ...p, idade: v }))} />
            <TextInput style={styles.input} placeholder="Peso" placeholderTextColor="#98abc9" keyboardType="decimal-pad" value={form.peso} onChangeText={(v) => setForm((p) => ({ ...p, peso: v }))} />

            <TouchableOpacity style={styles.selectButton} onPress={() => setOpenTipoSelect(true)}>
              <Text style={styles.selectLabel}>Tipo do pet</Text>
              <Text style={styles.selectValue}>{selectedTipoPet}</Text>
            </TouchableOpacity>

            <Text style={styles.helperText}>Tutor selecionado: {selectedUser ? `${selectedUser.nome} (${selectedUser.id})` : "Nenhum"}</Text>
            {!isEdit ? (
              <TouchableOpacity style={styles.selectButton} onPress={() => setOpenTutorSelect(true)}>
                <Text style={styles.selectLabel}>Tutor</Text>
                <Text style={styles.selectValue}>{selectedUser ? `${selectedUser.nome} (${selectedUser.id})` : "Selecionar tutor"}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.selectButtonDisabled}>
                <Text style={styles.selectLabel}>Tutor</Text>
                <Text style={styles.selectValue}>{selectedUser ? `${selectedUser.nome} (${selectedUser.id})` : form.usuarioId}</Text>
              </View>
            )}
            {isEdit && <Text style={styles.helperText}>No modo edição, o tutor fica fixo.</Text>}

            <TouchableOpacity style={styles.toggleButton} onPress={() => setForm((p) => ({ ...p, castrado: !p.castrado }))}>
              <Text style={styles.toggleText}>Castrado: {form.castrado ? "Sim" : "Não"}</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="URL da imagem"
              placeholderTextColor="#98abc9"
              value={form.foto}
              onChangeText={(v) => {
                setForm((p) => ({ ...p, foto: v }));
                if (!v.trim()) setImageStatus("idle");
              }}
              onBlur={() => void handleValidateImageUrl(form.foto)}
            />

            {imageStatus === "loading" && <Text style={styles.helperText}>Validando imagem...</Text>}
            {imageStatus === "error" && <Text style={styles.errorText}>URL inválida. Você pode salvar sem foto.</Text>}

            {!!form.foto.trim() && imageStatus === "ok" && (
              <Image source={{ uri: form.foto.trim() }} style={styles.previewImage} resizeMode="cover" />
            )}

            {!!formError && <Text style={styles.errorText}>{formError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={closeModal}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.modalSaveText}>{saving ? "Salvando..." : "Salvar"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={confirmDeleteId !== null} animationType="fade" onRequestClose={() => setConfirmDeleteId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirmar exclusão</Text>
            <Text style={styles.helperText}>Deseja remover este pet?</Text>
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
        visible={openTutorSelect}
        title="Selecionar tutor"
        options={tutorOptions}
        onClose={() => setOpenTutorSelect(false)}
        onSelect={(option) => setForm((prev) => ({ ...prev, usuarioId: option.value }))}
      />

      <SearchableSelectModal
        visible={openTipoSelect}
        title="Selecionar tipo do pet"
        options={tipoPetOptions}
        onClose={() => setOpenTipoSelect(false)}
        onSelect={(option) => setForm((prev) => ({ ...prev, tipoPet: option.value }))}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { width: "100%", maxWidth: 1080, alignSelf: "center", paddingHorizontal: 22, paddingVertical: 22, gap: 14 },
  headerCard: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.30)",
    backgroundColor: "rgba(19, 37, 59, 0.9)",
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
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
  primaryButton: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1d67e0", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, alignSelf: "flex-start" },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  listCard: { borderWidth: 1, borderColor: "rgba(138,180,248,0.20)", backgroundColor: "rgba(13, 32, 53, 0.88)", borderRadius: 16, padding: 14, gap: 10 },
  infoText: { color: "#b7c8e8", fontSize: 14 },
  itemCard: { borderWidth: 1, borderColor: "rgba(138,180,248,0.20)", backgroundColor: "rgba(20, 56, 99, 0.55)", borderRadius: 12, padding: 12, flexDirection: "row", justifyContent: "space-between", gap: 10 },
  itemImage: { width: 88, height: 88, borderRadius: 10 },
  itemImageFallback: { alignItems: "center", justifyContent: "center", backgroundColor: "rgba(11, 27, 44, 0.7)", borderWidth: 1, borderColor: "rgba(138,180,248,0.25)" },
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
  selectButtonDisabled: { borderWidth: 1, borderColor: "rgba(138,180,248,0.20)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "rgba(20, 56, 99, 0.25)", gap: 2 },
  selectLabel: { color: "#9fc0f6", fontSize: 11, fontWeight: "700" },
  selectValue: { color: "#eaf2ff", fontSize: 13 },
  helperText: { color: "#b7c8e8", fontSize: 12 },
  toggleButton: { borderRadius: 10, borderWidth: 1, borderColor: "rgba(138,180,248,0.35)", backgroundColor: "rgba(20, 56, 99, 0.35)", paddingVertical: 10, paddingHorizontal: 12 },
  toggleText: { color: "#dbe9ff", fontWeight: "700", fontSize: 12 },
  previewImage: { width: "100%", height: 170, borderRadius: 10, borderWidth: 1, borderColor: "rgba(138,180,248,0.25)" },
  errorText: { color: "#ffb0b0", fontSize: 13, lineHeight: 18 },
  modalActions: { marginTop: 4, flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalCancel: { borderRadius: 10, borderWidth: 1, borderColor: "rgba(138,180,248,0.35)", paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "rgba(20, 56, 99, 0.35)" },
  modalCancelText: { color: "#dbe9ff", fontWeight: "700" },
  modalSave: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#1d67e0" },
  modalSaveText: { color: "#fff", fontWeight: "700" },
  modalDelete: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#c73939" },
  modalDeleteText: { color: "#fff", fontWeight: "700" },
});
