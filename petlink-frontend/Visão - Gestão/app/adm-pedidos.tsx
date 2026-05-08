import { AuthContext } from "@/src/context/AuthContext";
import SearchableSelectModal, { SelectOption } from "@/components/SearchableSelectModal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import { createAdminPedido, cancelAdminPedido, getAdminPedidos, Pedido } from "@/src/api/pedidoService";
import { createAdminItemPedido, getAdminItensByPedido, ItemPedido } from "@/src/api/itemPedidoService";
import { getUsuarios, Usuario } from "@/src/api/usuarioService";
import { getProdutos, Produto } from "@/src/api/produtoService";
import { parseIntInput } from "@/src/utils/numberUtils";

type NewItem = {
  produtoId: string;
  quantidade: string;
};

const INITIAL_ITEM: NewItem = {
  produtoId: "",
  quantidade: "1",
};

export default function AdmPedidos() {
  const router = useRouter();
  const { token } = useContext(AuthContext);

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [itensMap, setItensMap] = useState<Record<number, ItemPedido[]>>({});
  const [loading, setLoading] = useState(true);

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [emNomeProprio, setEmNomeProprio] = useState(false);
  const [usuarioId, setUsuarioId] = useState("");
  const [newItem, setNewItem] = useState<NewItem>(INITIAL_ITEM);
  const [pendingItems, setPendingItems] = useState<Array<{ produtoId: number; quantidade: number }>>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [openUsuarioSelect, setOpenUsuarioSelect] = useState(false);
  const [openProdutoSelect, setOpenProdutoSelect] = useState(false);

  const [confirmCancelId, setConfirmCancelId] = useState<number | null>(null);

  const usersById = useMemo(() => {
    const map: Record<number, Usuario> = {};
    usuarios.forEach((u) => {
      map[u.id] = u;
    });
    return map;
  }, [usuarios]);

  const productById = useMemo(() => {
    const map: Record<number, Produto> = {};
    produtos.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [produtos]);

  const usuarioOptions = useMemo<SelectOption[]>(
    () =>
      usuarios.map((usuario) => ({
        value: String(usuario.id),
        label: usuario.nome,
        subtitle: `ID ${usuario.id} • ${usuario.email}`,
      })),
    [usuarios]
  );

  const produtoOptions = useMemo<SelectOption[]>(
    () =>
      produtos.map((produto) => ({
        value: String(produto.id),
        label: produto.nome,
        subtitle: `ID ${produto.id} • Estoque ${produto.quantidade}`,
      })),
    [produtos]
  );

  const selectedUsuario = useMemo(
    () => usuarios.find((usuario) => usuario.id === parseIntInput(usuarioId)),
    [usuarios, usuarioId]
  );

  const selectedProduto = useMemo(
    () => produtos.find((produto) => produto.id === parseIntInput(newItem.produtoId)),
    [produtos, newItem.produtoId]
  );

  const loadData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    const [pedidosResult, usuariosResult, produtosResult] = await Promise.all([
      getAdminPedidos(token),
      getUsuarios(token),
      getProdutos(token),
    ]);

    if (pedidosResult.ok && Array.isArray(pedidosResult?.data?.data)) {
      const pedidosData: Pedido[] = pedidosResult.data.data;
      setPedidos(pedidosData);

      const entries = await Promise.all(
        pedidosData.map(async (pedido) => {
          const itemsResult = await getAdminItensByPedido(pedido.id, token);
          const itens = itemsResult.ok && Array.isArray(itemsResult?.data?.data) ? itemsResult.data.data : [];
          return [pedido.id, itens] as const;
        })
      );

      const map: Record<number, ItemPedido[]> = {};
      entries.forEach(([id, itens]) => {
        map[id] = itens;
      });
      setItensMap(map);
    } else {
      Alert.alert("Erro", getApiErrorMessage(pedidosResult?.data, "Não foi possível carregar pedidos."));
    }

    if (usuariosResult.ok && Array.isArray(usuariosResult?.data?.data)) {
      setUsuarios(usuariosResult.data.data);
    } else {
      Alert.alert("Erro", getApiErrorMessage(usuariosResult?.data, "Não foi possível carregar usuários."));
    }

    if (produtosResult.ok && Array.isArray(produtosResult?.data?.data)) {
      setProdutos(produtosResult.data.data);
    } else {
      Alert.alert("Erro", getApiErrorMessage(produtosResult?.data, "Não foi possível carregar produtos."));
    }

    setLoading(false);
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function openModal() {
    setOpenCreateModal(true);
    setEmNomeProprio(false);
    setUsuarioId("");
    setNewItem(INITIAL_ITEM);
    setPendingItems([]);
    setFormError("");
  }

  function closeModal() {
    setOpenCreateModal(false);
  }

  function addPendingItem() {
    setFormError("");
    const produtoId = parseIntInput(newItem.produtoId);
    const quantidade = parseIntInput(newItem.quantidade);

    if (Number.isNaN(produtoId) || produtoId <= 0 || !productById[produtoId]) {
      setFormError("Selecione um produto válido.");
      return;
    }

    if (Number.isNaN(quantidade) || quantidade <= 0) {
      setFormError("Quantidade inválida.");
      return;
    }

    setPendingItems((prev) => [...prev, { produtoId, quantidade }]);
    setNewItem(INITIAL_ITEM);
  }

  function removePendingItem(index: number) {
    setPendingItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreatePedido() {
    if (!token) return;

    setFormError("");

    if (!emNomeProprio) {
      const parsedUsuario = parseIntInput(usuarioId);
      if (Number.isNaN(parsedUsuario) || parsedUsuario <= 0) {
        setFormError("Selecione um usuário válido para criar o pedido.");
        return;
      }
    }

    if (pendingItems.length === 0) {
      setFormError("Adicione pelo menos um item ao pedido.");
      return;
    }

    setSaving(true);

    const createResult = await createAdminPedido(
      {
        emNomeProprio,
        usuarioId: emNomeProprio ? undefined : parseIntInput(usuarioId),
      },
      token
    );

    if (!createResult.ok) {
      setSaving(false);
      setFormError(getApiErrorMessage(createResult?.data, "Não foi possível criar o pedido."));
      return;
    }

    const pedidoId = createResult?.data?.data?.id;
    if (!pedidoId) {
      setSaving(false);
      setFormError("Resposta inválida ao criar pedido.");
      return;
    }

    const failures: string[] = [];

    for (const item of pendingItems) {
      const itemResult = await createAdminItemPedido(
        {
          pedidoId,
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        },
        token
      );

      if (!itemResult.ok) {
        failures.push(`Produto ${item.produtoId}: ${getApiErrorMessage(itemResult?.data, "falha ao incluir")}`);
      }
    }

    setSaving(false);

    if (failures.length > 0) {
      setFormError(`Pedido criado, mas houve falha em alguns itens:\n${failures.join("\n")}`);
      await loadData();
      return;
    }

    closeModal();
    await loadData();
  }

  async function handleCancelPedido() {
    if (!token || confirmCancelId === null) return;

    const result = await cancelAdminPedido(confirmCancelId, token);
    setConfirmCancelId(null);

    if (!result.ok) {
      Alert.alert("Erro", getApiErrorMessage(result?.data, "Não foi possível cancelar o pedido."));
      return;
    }

    setPedidos((prev) => prev.filter((p) => p.id !== confirmCancelId));
    setItensMap((prev) => {
      const next = { ...prev };
      delete next[confirmCancelId];
      return next;
    });
  }

  return (
    <LinearGradient colors={["#071321", "#0d1b2a", "#12263f"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.headerCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.badge}>Módulo Administrativo</Text>
            <Text style={styles.title}>Pedidos</Text>
            <Text style={styles.subtitle}>Criação por usuário/administrador e cancelamento por exclusão com estorno.</Text>
          </View>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back-outline" size={16} color="#dbe9ff" />
            <Text style={styles.backButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={openModal}>
          <Ionicons name="add-circle-outline" size={18} color="#fff" />
          <Text style={styles.primaryButtonText}>Novo pedido</Text>
        </TouchableOpacity>

        <View style={styles.listCard}>
          {loading ? (
            <Text style={styles.infoText}>Carregando pedidos...</Text>
          ) : pedidos.length === 0 ? (
            <Text style={styles.infoText}>Nenhum pedido encontrado.</Text>
          ) : (
            pedidos.map((pedido) => {
              const usuario = usersById[pedido.usuarioId];
              const itens = itensMap[pedido.id] || [];
              return (
                <View key={pedido.id} style={styles.itemCard}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text style={styles.itemTitle}>Pedido #{pedido.id}</Text>
                    <Text style={styles.itemSubtitle}>Usuário: {usuario ? `${usuario.nome} (${usuario.id})` : pedido.usuarioId}</Text>
                    <Text style={styles.itemSubtitle}>Data: {new Date(pedido.dataPedido).toLocaleString("pt-BR")}</Text>
                    <Text style={styles.itemSubtitle}>Itens: {itens.length}</Text>
                    {itens.map((item) => (
                      <Text key={item.id} style={styles.itemDetail}>• {productById[item.produtoId]?.nome || `Produto ${item.produtoId}`} x {item.quantidade}</Text>
                    ))}
                  </View>

                  <TouchableOpacity style={[styles.iconAction, styles.iconDanger]} onPress={() => setConfirmCancelId(pedido.id)}>
                    <Ionicons name="trash-outline" size={16} color="#ffd5d5" />
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      <Modal transparent visible={openCreateModal} animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Novo pedido</Text>

            <TouchableOpacity style={styles.toggleButton} onPress={() => setEmNomeProprio((v) => !v)}>
              <Text style={styles.toggleText}>Criar em nome próprio: {emNomeProprio ? "Sim" : "Não"}</Text>
            </TouchableOpacity>

            {!emNomeProprio && (
              <TouchableOpacity style={styles.selectButton} onPress={() => setOpenUsuarioSelect(true)}>
                <Text style={styles.selectLabel}>Usuário</Text>
                <Text style={styles.selectValue}>{selectedUsuario ? `${selectedUsuario.nome} (${selectedUsuario.id})` : "Selecionar usuário"}</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Adicionar item</Text>
            <TouchableOpacity style={styles.selectButton} onPress={() => setOpenProdutoSelect(true)}>
              <Text style={styles.selectLabel}>Produto</Text>
              <Text style={styles.selectValue}>{selectedProduto ? `${selectedProduto.nome} (${selectedProduto.id})` : "Selecionar produto"}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              placeholderTextColor="#98abc9"
              keyboardType="number-pad"
              value={newItem.quantidade}
              onChangeText={(v) => setNewItem((p) => ({ ...p, quantidade: v }))}
            />
            <TouchableOpacity style={styles.secondaryButton} onPress={addPendingItem}>
              <Text style={styles.secondaryButtonText}>Adicionar item à lista</Text>
            </TouchableOpacity>

            {pendingItems.length > 0 && (
              <View style={styles.pendingBox}>
                {pendingItems.map((item, index) => (
                  <View key={`${item.produtoId}-${index}`} style={styles.pendingRow}>
                    <Text style={styles.pendingText}>{productById[item.produtoId]?.nome || `Produto ${item.produtoId}`} x {item.quantidade}</Text>
                    <TouchableOpacity onPress={() => removePendingItem(index)}>
                      <Ionicons name="close-circle-outline" size={18} color="#ffb0b0" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {!!formError && <Text style={styles.errorText}>{formError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={closeModal}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSave} onPress={handleCreatePedido} disabled={saving}>
                <Text style={styles.modalSaveText}>{saving ? "Salvando..." : "Criar pedido"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={confirmCancelId !== null} animationType="fade" onRequestClose={() => setConfirmCancelId(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Cancelar pedido</Text>
            <Text style={styles.infoText}>Ao cancelar, os itens serão removidos e o estoque será estornado.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setConfirmCancelId(null)}>
                <Text style={styles.modalCancelText}>Voltar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDelete} onPress={handleCancelPedido}>
                <Text style={styles.modalDeleteText}>Cancelar pedido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <SearchableSelectModal
        visible={openUsuarioSelect}
        title="Selecionar usuário"
        options={usuarioOptions}
        onClose={() => setOpenUsuarioSelect(false)}
        onSelect={(option) => setUsuarioId(option.value)}
      />

      <SearchableSelectModal
        visible={openProdutoSelect}
        title="Selecionar produto"
        options={produtoOptions}
        onClose={() => setOpenProdutoSelect(false)}
        onSelect={(option) => setNewItem((prev) => ({ ...prev, produtoId: option.value }))}
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
  itemDetail: { color: "#9fc0f6", fontSize: 12 },
  iconAction: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(38, 92, 167, 0.45)", borderWidth: 1, borderColor: "rgba(138,180,248,0.25)" },
  iconDanger: { backgroundColor: "rgba(155, 45, 45, 0.38)", borderColor: "rgba(255, 138, 138, 0.25)" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "center", padding: 18 },
  modalCard: { width: "100%", maxWidth: 560, alignSelf: "center", borderRadius: 16, borderWidth: 1, borderColor: "rgba(138,180,248,0.30)", backgroundColor: "#0f253e", padding: 16, gap: 10 },
  modalTitle: { color: "#edf4ff", fontSize: 18, fontWeight: "700", marginBottom: 2 },
  sectionTitle: { color: "#edf4ff", fontSize: 14, fontWeight: "700", marginTop: 6 },
  input: { borderWidth: 1, borderColor: "rgba(138,180,248,0.25)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, color: "#eaf2ff", backgroundColor: "rgba(20, 56, 99, 0.45)" },
  selectButton: { borderWidth: 1, borderColor: "rgba(138,180,248,0.25)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "rgba(20, 56, 99, 0.45)", gap: 2 },
  selectLabel: { color: "#9fc0f6", fontSize: 11, fontWeight: "700" },
  selectValue: { color: "#eaf2ff", fontSize: 13 },
  toggleButton: { borderRadius: 10, borderWidth: 1, borderColor: "rgba(138,180,248,0.35)", backgroundColor: "rgba(20, 56, 99, 0.35)", paddingVertical: 10, paddingHorizontal: 12 },
  toggleText: { color: "#dbe9ff", fontWeight: "700", fontSize: 12 },
  secondaryButton: { borderRadius: 10, borderWidth: 1, borderColor: "rgba(138,180,248,0.35)", backgroundColor: "rgba(33, 87, 155, 0.45)", paddingVertical: 10, paddingHorizontal: 12, alignItems: "center" },
  secondaryButtonText: { color: "#eaf2ff", fontWeight: "700", fontSize: 12 },
  pendingBox: { borderWidth: 1, borderColor: "rgba(138,180,248,0.22)", borderRadius: 10, padding: 8, gap: 6, backgroundColor: "rgba(20, 56, 99, 0.35)" },
  pendingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pendingText: { color: "#cddcf5", fontSize: 12 },
  errorText: { color: "#ffb0b0", fontSize: 13, lineHeight: 18 },
  modalActions: { marginTop: 4, flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalCancel: { borderRadius: 10, borderWidth: 1, borderColor: "rgba(138,180,248,0.35)", paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "rgba(20, 56, 99, 0.35)" },
  modalCancelText: { color: "#dbe9ff", fontWeight: "700" },
  modalSave: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#1d67e0" },
  modalSaveText: { color: "#fff", fontWeight: "700" },
  modalDelete: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#c73939" },
  modalDeleteText: { color: "#fff", fontWeight: "700" },
});
