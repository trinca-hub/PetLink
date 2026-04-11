import {
  AdminAnuncio,
  deleteAdminAnuncio,
  getAdminAnuncios,
  updateAdminAnuncioDescricao,
  updateAdminAnuncioPaypet,
  updateAdminAnuncioPetfinder,
} from "@/src/api/anuncioService";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import { AuthContext } from "@/src/context/AuthContext";
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

type TipoFiltro = "all" | 1 | 2 | 3;

type EditForm = {
  descricao: string;
  ultimoLocalVisto: string;
  dataDesaparecimento: string;
  tipoPayPet: string;
  valor: string;
};

const INITIAL_EDIT_FORM: EditForm = {
  descricao: "",
  ultimoLocalVisto: "",
  dataDesaparecimento: "",
  tipoPayPet: "1",
  valor: "",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("pt-BR");
}

function formatMoney(value?: number | null) {
  if (value === null || value === undefined) return "-";
  return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function toInputDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function tipoBadgeColor(tipo: number) {
  if (tipo === 1) return "#3f79d9";
  if (tipo === 2) return "#e08831";
  return "#2eaa64";
}

export default function ListaAnuncios() {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [anuncios, setAnuncios] = useState<AdminAnuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipoFiltro, setTipoFiltro] = useState<TipoFiltro>("all");
  const [search, setSearch] = useState("");

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAnuncio | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(INITIAL_EDIT_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const loadAnuncios = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    const result = await getAdminAnuncios(token);

    if (result.ok && Array.isArray(result?.data?.data)) {
      setAnuncios(result.data.data);
    } else {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível carregar anúncios."));
    }

    setLoading(false);
  }, [token]);

  const anunciosFiltrados = useMemo(() => {
    const query = search.trim().toLowerCase();

    return anuncios.filter((item) => {
      if (tipoFiltro !== "all" && item.tipoAnuncio !== tipoFiltro) return false;

      if (!query) return true;

      const target = [
        item.nomePet,
        item.racaPet,
        item.tipoPet,
        item.nomeUsuario,
        item.telefoneUsuario,
        item.cidade,
        item.bairro,
        item.descricao,
        item.tipoAnuncioLabel,
      ]
        .join(" ")
        .toLowerCase();

      return target.includes(query);
    });
  }, [anuncios, tipoFiltro, search]);

  function openEditModal(item: AdminAnuncio) {
    setEditing(item);
    setEditForm({
      descricao: item.descricao || "",
      ultimoLocalVisto: item.ultimoLocalVisto || "",
      dataDesaparecimento: toInputDate(item.dataDesaparecimento),
      tipoPayPet: String(item.tipoPayPet ?? 1),
      valor: item.valor !== null && item.valor !== undefined ? String(item.valor) : "",
    });
    setFormError("");
    setEditModalOpen(true);
  }

  function closeEditModal() {
    setEditModalOpen(false);
    setEditing(null);
    setEditForm(INITIAL_EDIT_FORM);
    setFormError("");
  }

  async function saveEdit() {
    if (!token || !editing) return;

    if (!editForm.descricao.trim()) {
      setFormError("Descrição é obrigatória.");
      return;
    }

    setSaving(true);
    setFormError("");

    const resultDescricao = await updateAdminAnuncioDescricao(editing.anuncioId, editForm.descricao.trim(), token);
    if (!resultDescricao.ok) {
      setSaving(false);
      setFormError(getApiErrorMessage(resultDescricao?.data, "Não foi possível atualizar a descrição."));
      return;
    }

    if (editing.tipoAnuncio === 2) {
      if (!editForm.ultimoLocalVisto.trim() || !editForm.dataDesaparecimento) {
        setSaving(false);
        setFormError("Informe último local visto e data de desaparecimento.");
        return;
      }

      const resultPetFinder = await updateAdminAnuncioPetfinder(
        editing.anuncioId,
        {
          ultimoLocalVisto: editForm.ultimoLocalVisto.trim(),
          dataDesaparecimento: new Date(`${editForm.dataDesaparecimento}T12:00:00.000Z`).toISOString(),
        },
        token
      );

      if (!resultPetFinder.ok) {
        setSaving(false);
        setFormError(getApiErrorMessage(resultPetFinder?.data, "Não foi possível atualizar os dados de PetFinder."));
        return;
      }
    }

    if (editing.tipoAnuncio === 3) {
      const tipoPayPet = Number(editForm.tipoPayPet);
      const isDoacao = tipoPayPet === 1;
      const isVenda = tipoPayPet === 2;

      if (!isDoacao && !isVenda) {
        setSaving(false);
        setFormError("Tipo do PayPet inválido. Use 1 (adoção) ou 2 (venda).");
        return;
      }

      const valor = isDoacao
        ? 0
        : Number(editForm.valor.replace(".", "").replace(",", "."));

      if (isVenda && (Number.isNaN(valor) || valor <= 0)) {
        setSaving(false);
        setFormError("Para venda, informe um valor maior que zero.");
        return;
      }

      const resultPayPet = await updateAdminAnuncioPaypet(
        editing.anuncioId,
        {
          tipoPayPet,
          valor: isDoacao ? 0 : valor,
        },
        token
      );

      if (!resultPayPet.ok) {
        setSaving(false);
        setFormError(getApiErrorMessage(resultPayPet?.data, "Não foi possível atualizar os dados de PayPet."));
        return;
      }
    }

    setSaving(false);
    closeEditModal();
    await loadAnuncios();
  }

  async function confirmDelete() {
    if (!token || confirmDeleteId === null) return;

    const result = await deleteAdminAnuncio(confirmDeleteId, token);
    setConfirmDeleteId(null);

    if (!result.ok) {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível remover o anúncio."));
      return;
    }

    setAnuncios((prev) => prev.filter((item) => item.anuncioId !== confirmDeleteId));
  }

  useEffect(() => {
    loadAnuncios();
  }, [loadAnuncios]);

  return (
    <LinearGradient colors={["#071321", "#0d1b2a", "#12263f"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.badge}>Módulo Administrativo</Text>
            <Text style={styles.title}>Anúncios</Text>
            <Text style={styles.subtitle}>Visão completa por tipo para gerenciamento administrativo.</Text>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={16} color="#dbe9ff" />
            <Text style={styles.backButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>Total de anúncios: {anunciosFiltrados.length}</Text>
          <TouchableOpacity onPress={loadAnuncios}>
            <Text style={styles.refreshText}>{loading ? "Atualizando..." : "Atualizar"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterCard}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por pet, usuário, cidade ou descrição"
            placeholderTextColor="#9fb3d1"
            value={search}
            onChangeText={setSearch}
          />

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[styles.filterPill, tipoFiltro === "all" && styles.filterPillActive]}
              onPress={() => setTipoFiltro("all")}
            >
              <Text style={[styles.filterText, tipoFiltro === "all" && styles.filterTextActive]}>Todos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, tipoFiltro === 1 && styles.filterPillActive]}
              onPress={() => setTipoFiltro(1)}
            >
              <Text style={[styles.filterText, tipoFiltro === 1 && styles.filterTextActive]}>PeTinder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, tipoFiltro === 2 && styles.filterPillActive]}
              onPress={() => setTipoFiltro(2)}
            >
              <Text style={[styles.filterText, tipoFiltro === 2 && styles.filterTextActive]}>PetFinder</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.filterPill, tipoFiltro === 3 && styles.filterPillActive]}
              onPress={() => setTipoFiltro(3)}
            >
              <Text style={[styles.filterText, tipoFiltro === 3 && styles.filterTextActive]}>PayPet</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.listCard}>
          {loading ? (
            <Text style={styles.infoText}>Carregando anúncios...</Text>
          ) : anunciosFiltrados.length === 0 ? (
            <Text style={styles.infoText}>Nenhum anúncio encontrado.</Text>
          ) : (
            anunciosFiltrados.map((item) => (
              <View key={item.anuncioId} style={styles.itemCard}>
                <View style={styles.topRow}>
                  <Text style={styles.itemTitle}>#{item.anuncioId} - {item.tipoAnuncioLabel}</Text>
                  <View style={[styles.typeBadge, { backgroundColor: tipoBadgeColor(item.tipoAnuncio) }]}>
                    <Text style={styles.typeBadgeText}>{item.tipoAnuncioLabel}</Text>
                  </View>
                </View>

                <View style={styles.mainRow}>
                  {!!item.fotoPet ? (
                    <Image source={{ uri: item.fotoPet }} style={styles.petImage} resizeMode="cover" />
                  ) : (
                    <View style={styles.petImageFallback}>
                      <Ionicons name="paw-outline" size={28} color="#8fb1e0" />
                    </View>
                  )}

                  <View style={styles.itemMain}>
                    <Text style={styles.petName}>{item.nomePet}</Text>
                    <Text style={styles.itemSubtitle}>{item.tipoPet} • {item.racaPet} • {item.idadePet || "Idade não informada"}</Text>
                    <Text style={styles.itemSubtitle}>Sexo: {item.sexoPet || "Não informado"}</Text>
                    <Text style={styles.itemOwner}>Tutor: {item.nomeUsuario} • {item.telefoneUsuario}</Text>
                    <Text style={styles.itemAddress}>
                      {item.rua}, {item.numero} - {item.bairro}, {item.cidade}/{item.uf}
                    </Text>
                    <Text style={styles.itemDescription}>{item.descricao || "Sem descrição"}</Text>

                    {item.tipoAnuncio === 2 && (
                      <View style={styles.specificBox}>
                        <Text style={styles.specificTitle}>Dados do PetFinder</Text>
                        <Text style={styles.specificText}>Último local visto: {item.ultimoLocalVisto || "-"}</Text>
                        <Text style={styles.specificText}>Data de desaparecimento: {formatDate(item.dataDesaparecimento)}</Text>
                      </View>
                    )}

                    {item.tipoAnuncio === 3 && (
                      <View style={styles.specificBox}>
                        <Text style={styles.specificTitle}>Dados do PayPet</Text>
                        <Text style={styles.specificText}>Tipo: {item.tipoPayPet === 2 ? "Venda" : "Adoção"}</Text>
                        <Text style={styles.specificText}>Valor: {item.tipoPayPet === 2 ? formatMoney(item.valor) : "Não se aplica"}</Text>
                      </View>
                    )}

                    <Text style={styles.createdAt}>Criado em: {formatDateTime(item.dataCriacao)}</Text>
                  </View>
                </View>

                <View style={styles.actionsRow}>
                  <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
                    <Ionicons name="create-outline" size={16} color="#eaf2ff" />
                    <Text style={styles.actionText}>Editar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteButton} onPress={() => setConfirmDeleteId(item.anuncioId)}>
                    <Ionicons name="trash-outline" size={16} color="#ffd5d5" />
                    <Text style={styles.actionText}>Excluir</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal transparent visible={editModalOpen} animationType="fade" onRequestClose={closeEditModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Editar anúncio {editing ? `#${editing.anuncioId}` : ""}</Text>

            <TextInput
              style={[styles.input, styles.multilineInput]}
              multiline
              numberOfLines={4}
              placeholder="Descrição"
              placeholderTextColor="#98abc9"
              value={editForm.descricao}
              onChangeText={(value) => setEditForm((prev) => ({ ...prev, descricao: value }))}
            />

            {editing?.tipoAnuncio === 2 && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Último local visto"
                  placeholderTextColor="#98abc9"
                  value={editForm.ultimoLocalVisto}
                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, ultimoLocalVisto: value }))}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Data de desaparecimento (AAAA-MM-DD)"
                  placeholderTextColor="#98abc9"
                  value={editForm.dataDesaparecimento}
                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, dataDesaparecimento: value }))}
                />
              </>
            )}

            {editing?.tipoAnuncio === 3 && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Tipo PayPet (1 = adoção, 2 = venda)"
                  placeholderTextColor="#98abc9"
                  keyboardType="numeric"
                  value={editForm.tipoPayPet}
                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, tipoPayPet: value }))}
                />

                <TextInput
                  style={styles.input}
                  placeholder="Valor (somente para venda)"
                  placeholderTextColor="#98abc9"
                  keyboardType="numeric"
                  value={editForm.valor}
                  onChangeText={(value) => setEditForm((prev) => ({ ...prev, valor: value }))}
                />
              </>
            )}

            {!!formError && <Text style={styles.errorText}>{formError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={closeEditModal}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSave} onPress={saveEdit} disabled={saving}>
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
            <Text style={styles.confirmText}>Tem certeza que deseja excluir este anúncio?</Text>

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
  summaryBar: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.20)",
    backgroundColor: "rgba(13, 32, 53, 0.88)",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryText: { color: "#eaf2ff", fontWeight: "700", fontSize: 14 },
  refreshText: { color: "#9fc0f6", fontWeight: "700", fontSize: 13 },
  filterCard: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.20)",
    backgroundColor: "rgba(13, 32, 53, 0.88)",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#eaf2ff",
    backgroundColor: "rgba(20, 56, 99, 0.45)",
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterPill: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.30)",
    backgroundColor: "rgba(20, 56, 99, 0.35)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterPillActive: {
    backgroundColor: "#1d67e0",
    borderColor: "#1d67e0",
  },
  filterText: {
    color: "#c4d6f2",
    fontSize: 12,
    fontWeight: "700",
  },
  filterTextActive: { color: "#fff" },
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
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  typeBadgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 11,
  },
  mainRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  petImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
  },
  petImageFallback: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
    backgroundColor: "rgba(11, 27, 44, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  itemMain: { flex: 1, gap: 4 },
  itemTitle: { color: "#f4f8ff", fontSize: 15, fontWeight: "700" },
  petName: { color: "#f4f8ff", fontSize: 17, fontWeight: "700" },
  itemSubtitle: { color: "#b7c8e8", fontSize: 12, lineHeight: 18 },
  itemOwner: { color: "#d8e7ff", fontSize: 12, fontWeight: "700" },
  itemAddress: { color: "#9fc0f6", fontSize: 12, lineHeight: 17 },
  itemDescription: {
    color: "#dce9ff",
    fontSize: 13,
    lineHeight: 18,
    backgroundColor: "rgba(11, 27, 44, 0.55)",
    borderRadius: 8,
    padding: 8,
    marginTop: 2,
  },
  specificBox: {
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    backgroundColor: "rgba(13, 32, 53, 0.75)",
    gap: 2,
  },
  specificTitle: { color: "#f4f8ff", fontWeight: "700", fontSize: 12 },
  specificText: { color: "#b7c8e8", fontSize: 12 },
  createdAt: { color: "#88a9db", fontSize: 11, marginTop: 2 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(38, 92, 167, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(138,180,248,0.25)",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(155, 45, 45, 0.38)",
    borderWidth: 1,
    borderColor: "rgba(255,138,138,0.25)",
  },
  actionText: { color: "#eaf2ff", fontWeight: "700", fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: 18,
  },
  modalCard: {
    width: "100%",
    maxWidth: 560,
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
  multilineInput: {
    minHeight: 92,
    textAlignVertical: "top",
  },
  confirmText: { color: "#c6d7f2", fontSize: 14, lineHeight: 20 },
  errorText: { color: "#ffb0b0", fontSize: 13, lineHeight: 18, marginTop: 2 },
  modalActions: {
    marginTop: 4,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
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
