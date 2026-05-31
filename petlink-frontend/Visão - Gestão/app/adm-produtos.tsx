import {
  createProduto,
  deleteProduto,
  getProdutos,
  Produto,
  updateProduto,
} from "@/src/api/produtoService";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import ListControls, { FilterGroup, SortState, TextFilter } from "@/components/ListControls";
import { AuthContext } from "@/src/context/AuthContext";
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
  preco: string;
  descricao: string;
  quantidade: string;
  foto: string;
};

const INITIAL_FORM: FormState = {
  nome: "",
  preco: "",
  descricao: "",
  quantidade: "",
  foto: "",
};

type ImageStatus = "idle" | "loading" | "ok" | "error";

export default function ListaProdutos() {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [formError, setFormError] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [imageStatus, setImageStatus] = useState<ImageStatus>("idle");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ field: "", direction: "none" });
  const [stockFilter, setStockFilter] = useState("todos");
  const [priceFilter, setPriceFilter] = useState("todos");
  const [nomeFilter, setNomeFilter] = useState("");
  const [descricaoFilter, setDescricaoFilter] = useState("");

  const isEdit = useMemo(() => editId !== null, [editId]);

  const filteredProdutos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const normalizedNomeFilter = nomeFilter.trim().toLowerCase();
    const normalizedDescricaoFilter = descricaoFilter.trim().toLowerCase();

    const result = produtos
      .filter((produto) => {
        const preco = Number(produto.preco || 0);
        const searchable = [produto.nome, produto.descricao, String(produto.id)]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          (!normalizedSearch || searchable.includes(normalizedSearch)) &&
          (!normalizedNomeFilter || (produto.nome || "").toLowerCase().includes(normalizedNomeFilter)) &&
          (!normalizedDescricaoFilter || (produto.descricao || "").toLowerCase().includes(normalizedDescricaoFilter)) &&
          (stockFilter === "todos" ||
            (stockFilter === "disponivel" ? produto.quantidade > 0 : produto.quantidade === 0)) &&
          (priceFilter === "todos" ||
            (priceFilter === "ate-50" ? preco <= 50 : priceFilter === "50-100" ? preco > 50 && preco <= 100 : preco > 100))
        );
      });

    if (sort.direction === "none") return result;

    return [...result].sort((a, b) => {
      const direction = sort.direction === "asc" ? 1 : -1;

      if (sort.field === "id") return (a.id - b.id) * direction;
      if (sort.field === "preco") return (Number(a.preco || 0) - Number(b.preco || 0)) * direction;
      if (sort.field === "estoque") return (a.quantidade - b.quantidade) * direction;
      return (a.nome || "").localeCompare(b.nome || "") * direction;
    });
  }, [produtos, search, nomeFilter, descricaoFilter, stockFilter, priceFilter, sort]);

  const produtoTextFilters = useMemo<TextFilter[]>(
    () => [
      { label: "Nome", value: nomeFilter, onChange: setNomeFilter, placeholder: "Pesquisar por nome do produto" },
      { label: "Descrição", value: descricaoFilter, onChange: setDescricaoFilter, placeholder: "Pesquisar por descrição" },
    ],
    [nomeFilter, descricaoFilter]
  );

  const produtoFilters = useMemo<FilterGroup[]>(
    () => [
      {
        label: "Estoque",
        value: stockFilter,
        onChange: setStockFilter,
        options: [
          { label: "Todos", value: "todos" },
          { label: "Disponível", value: "disponivel" },
          { label: "Sem estoque", value: "sem-estoque" },
        ],
      },
      {
        label: "Preço",
        value: priceFilter,
        onChange: setPriceFilter,
        options: [
          { label: "Todos", value: "todos" },
          { label: "Até R$ 50", value: "ate-50" },
          { label: "R$ 50-100", value: "50-100" },
          { label: "Acima R$ 100", value: "acima-100" },
        ],
      },
    ],
    [stockFilter, priceFilter]
  );

  const loadProdutos = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    const result = await getProdutos(token);

    if (result.ok && Array.isArray(result?.data?.data)) {
      setProdutos(result.data.data);
    } else {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível carregar produtos."));
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadProdutos();
  }, [loadProdutos]);

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

  function openEditModal(item: Produto) {
    setEditId(item.id);
    setForm({
      nome: item.nome || "",
      preco: String(item.preco ?? ""),
      descricao: item.descricao || "",
      quantidade: String(item.quantidade ?? ""),
      foto: item.foto || "",
    });
    setImageStatus(item.foto && isLikelyHttpUrl(item.foto) ? "ok" : "idle");
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
        "A URL da foto não passou na validação. Deseja salvar este produto sem foto?",
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

    if (!form.nome.trim() || !form.preco.trim() || !form.descricao.trim() || !form.quantidade.trim()) {
      setFormError("Preencha nome, preço, descrição e quantidade.");
      return;
    }

    const preco = parseDecimalInput(form.preco);
    const quantidade = parseIntInput(form.quantidade);

    if (Number.isNaN(preco) || preco <= 0) {
      setFormError("Preço inválido. Informe um valor maior que zero.");
      return;
    }

    if (Number.isNaN(quantidade) || quantidade < 0) {
      setFormError("Quantidade inválida.");
      return;
    }

    setSaving(true);

    let foto = form.foto.trim();
    if (foto && imageStatus === "error") {
      const shouldSaveWithoutPhoto = await askSaveWithoutPhoto();
      if (!shouldSaveWithoutPhoto) {
        return;
      }

      foto = "";
    }

    const payload = {
      id: editId ?? 0,
      nome: form.nome.trim(),
      preco,
      descricao: form.descricao.trim(),
      quantidade,
      foto: foto || undefined,
    };

    const result = isEdit && editId
      ? await updateProduto(editId, payload, token)
      : await createProduto(payload, token);

    setSaving(false);

    if (!result.ok) {
      setFormError(getApiErrorMessage(result?.data, "Não foi possível salvar o produto."));
      return;
    }

    closeModal();
    await loadProdutos();
  }

  async function confirmDelete() {
    if (!token || confirmDeleteId === null) {
      setConfirmDeleteId(null);
      return;
    }

    const result = await deleteProduto(confirmDeleteId, token);
    setConfirmDeleteId(null);

    if (!result.ok) {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível remover o produto."));
      return;
    }

    setProdutos((prev) => prev.filter((item) => item.id !== confirmDeleteId));
  }

  return (
    <LinearGradient colors={["#071321", "#0d1b2a", "#12263f"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.badge}>Módulo Administrativo</Text>
            <Text style={styles.title}>Produtos</Text>
            <Text style={styles.subtitle}>Organize catálogo, preços e estoque dos produtos.</Text>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={16} color="#dbe9ff" />
            <Text style={styles.backButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.primaryButton} onPress={openCreateModal}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Novo produto</Text>
          </TouchableOpacity>
        </View>

        <ListControls
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por produto, descrição..."
          sort={sort}
          onSortChange={setSort}
          sortFields={[
            { label: "Nome", value: "nome", type: "text" },
            { label: "Preço", value: "preco", type: "number" },
            { label: "Estoque", value: "estoque", type: "number" },
            { label: "ID", value: "id", type: "number" },
          ]}
          textFilters={produtoTextFilters}
          filters={produtoFilters}
          resultCount={filteredProdutos.length}
          totalCount={produtos.length}
        />

        <View style={styles.listCard}>
          {loading ? (
            <Text style={styles.infoText}>Carregando produtos...</Text>
          ) : filteredProdutos.length === 0 ? (
            <Text style={styles.infoText}>Nenhum produto cadastrado.</Text>
          ) : (
            filteredProdutos.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemLeftWrap}>
                  {item.foto ? (
                    <Image source={{ uri: item.foto }} style={styles.itemImage} />
                  ) : (
                    <View style={[styles.itemImage, styles.itemImageFallback]}>
                      <Ionicons name="image-outline" size={20} color="#8fb1e0" />
                    </View>
                  )}

                  <View style={styles.itemMain}>
                    <Text style={styles.itemTitle}>{item.nome}</Text>
                    <Text style={styles.itemSubtitle}>{item.descricao}</Text>
                    <Text style={styles.itemPrice}>Preço: R$ {Number(item.preco || 0).toFixed(2)}</Text>
                    <Text style={styles.itemStock}>Estoque: {item.quantidade}</Text>
                  </View>
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
            <Text style={styles.modalTitle}>{isEdit ? "Editar produto" : "Novo produto"}</Text>

            <TextInput
              style={styles.input}
              placeholder="Nome"
              placeholderTextColor="#98abc9"
              value={form.nome}
              onChangeText={(value) => setForm((prev) => ({ ...prev, nome: value }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Preço"
              placeholderTextColor="#98abc9"
              keyboardType="decimal-pad"
              value={form.preco}
              onChangeText={(value) => setForm((prev) => ({ ...prev, preco: value }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Descrição"
              placeholderTextColor="#98abc9"
              value={form.descricao}
              onChangeText={(value) => setForm((prev) => ({ ...prev, descricao: value }))}
            />

            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              placeholderTextColor="#98abc9"
              keyboardType="number-pad"
              value={form.quantidade}
              onChangeText={(value) => setForm((prev) => ({ ...prev, quantidade: value }))}
            />

            <TextInput
              style={styles.input}
              placeholder="URL da foto (opcional)"
              placeholderTextColor="#98abc9"
              value={form.foto}
              onChangeText={(value) => {
                setForm((prev) => ({ ...prev, foto: value }));
                if (!value.trim()) setImageStatus("idle");
              }}
              onBlur={() => void handleValidateImageUrl(form.foto)}
            />

            {imageStatus === "loading" && <Text style={styles.infoText}>Validando imagem...</Text>}
            {imageStatus === "error" && <Text style={styles.errorText}>URL inválida. Você pode salvar sem foto.</Text>}

            {!!form.foto.trim() && imageStatus === "ok" && (
              <Image source={{ uri: form.foto.trim() }} style={styles.previewImage} resizeMode="cover" />
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
            <Text style={styles.confirmText}>Tem certeza que deseja excluir este produto?</Text>

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
  itemLeftWrap: { flexDirection: "row", gap: 12, flex: 1 },
  itemImage: { width: 74, height: 74, borderRadius: 10 },
  itemImageFallback: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(11, 27, 44, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
  },
  itemMain: { flex: 1, gap: 3 },
  itemTitle: { color: "#f4f8ff", fontSize: 15, fontWeight: "700" },
  itemSubtitle: { color: "#b7c8e8", fontSize: 12 },
  itemPrice: { color: "#dce9ff", fontSize: 12, marginTop: 2 },
  itemStock: { color: "#9fc0f6", fontSize: 12, marginTop: 2 },
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
  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
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
