import { AuthContext } from "@/src/context/AuthContext";
import ListControls, { FilterGroup, SortState, TextFilter } from "@/components/ListControls";
import SearchableSelectModal, { SelectOption } from "@/components/SearchableSelectModal";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { getApiErrorMessage } from "@/src/api/errorUtils";
import { createAdminPedido, cancelAdminPedido, getAdminPedidos, Pedido } from "@/src/api/pedidoService";
import { getAdminItensByPedido, ItemPedido } from "@/src/api/itemPedidoService";
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

function formatMoney(value: number | undefined) {
  return (value ?? 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

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
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({ field: "", direction: "none" });
  const [usuarioTextFilter, setUsuarioTextFilter] = useState("");
  const [itensFilter, setItensFilter] = useState("todos");

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
        subtitle: `ID ${produto.id} • Estoque ${produto.quantidade} • ${formatMoney(produto.preco)}`,
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

  const getLineTotal = useCallback(
    (produtoId: number, quantidade: number) => (productById[produtoId]?.preco ?? 0) * quantidade,
    [productById]
  );

  const pendingTotal = useMemo(
    () => pendingItems.reduce((total, item) => total + getLineTotal(item.produtoId, item.quantidade), 0),
    [pendingItems, getLineTotal]
  );

  const pendingQuantityByProduto = useMemo(() => {
    const map: Record<number, number> = {};
    pendingItems.forEach((item) => {
      map[item.produtoId] = (map[item.produtoId] || 0) + item.quantidade;
    });
    return map;
  }, [pendingItems]);

  const canCreatePedido = pendingItems.length > 0 && !saving && (emNomeProprio || !!selectedUsuario);

  function getPedidoTotal(itens: ItemPedido[]) {
    return itens.reduce((total, item) => total + getLineTotal(item.produtoId, item.quantidade), 0);
  }

  const filteredPedidos = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    const normalizedUsuarioFilter = usuarioTextFilter.trim().toLowerCase();

    const result = pedidos
      .filter((pedido) => {
        const usuario = usersById[pedido.usuarioId];
        const itens = itensMap[pedido.id] || [];
        const produtosPedido = itens.map((item) => productById[item.produtoId]?.nome || `Produto ${item.produtoId}`);
        const searchable = [
          `pedido ${pedido.id}`,
          String(pedido.id),
          usuario?.nome,
          usuario?.email,
          String(pedido.usuarioId),
          ...produtosPedido,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return (
          (!normalizedSearch || searchable.includes(normalizedSearch)) &&
          (!normalizedUsuarioFilter ||
            (usuario?.nome || "").toLowerCase().includes(normalizedUsuarioFilter) ||
            (usuario?.email || "").toLowerCase().includes(normalizedUsuarioFilter)) &&
          (itensFilter === "todos" ||
            (itensFilter === "com-itens" ? itens.length > 0 : itens.length === 0))
        );
      });

    if (sort.direction === "none") return result;

    return [...result].sort((a, b) => {
      const direction = sort.direction === "asc" ? 1 : -1;
      const itensA = itensMap[a.id] || [];
      const itensB = itensMap[b.id] || [];

      if (sort.field === "id") return (a.id - b.id) * direction;
      if (sort.field === "total") return (getPedidoTotal(itensA) - getPedidoTotal(itensB)) * direction;
      if (sort.field === "usuario") return (usersById[a.usuarioId]?.nome || "").localeCompare(usersById[b.usuarioId]?.nome || "") * direction;
      if (sort.field === "data") return (new Date(a.dataPedido).getTime() - new Date(b.dataPedido).getTime()) * direction;
      return 0;
    });
  }, [pedidos, usersById, itensMap, productById, search, usuarioTextFilter, itensFilter, sort]);

  const pedidoTextFilters = useMemo<TextFilter[]>(
    () => [
      {
        label: "Usuário",
        value: usuarioTextFilter,
        onChange: setUsuarioTextFilter,
        placeholder: "Pesquisar por nome ou email do usuário",
      },
    ],
    [usuarioTextFilter]
  );

  const pedidoFilters = useMemo<FilterGroup[]>(
    () => [
      {
        label: "Itens",
        value: itensFilter,
        onChange: setItensFilter,
        options: [
          { label: "Todos", value: "todos" },
          { label: "Com itens", value: "com-itens" },
          { label: "Sem itens", value: "sem-itens" },
        ],
      },
    ],
    [itensFilter]
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
    const produto = productById[produtoId];

    if (Number.isNaN(produtoId) || produtoId <= 0 || !produto) {
      setFormError("Selecione um produto válido.");
      return;
    }

    if (Number.isNaN(quantidade) || quantidade <= 0) {
      setFormError("Quantidade inválida.");
      return;
    }

    const quantidadeAtual = pendingQuantityByProduto[produtoId] || 0;
    if (quantidadeAtual + quantidade > produto.quantidade) {
      setFormError(`Estoque insuficiente. Disponível: ${produto.quantidade}. Já separado: ${quantidadeAtual}.`);
      return;
    }

    setPendingItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.produtoId === produtoId);
      if (existingIndex < 0) return [...prev, { produtoId, quantidade }];

      return prev.map((item, index) =>
        index === existingIndex ? { ...item, quantidade: item.quantidade + quantidade } : item
      );
    });
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

    const stockError = pendingItems.find((item) => item.quantidade > (productById[item.produtoId]?.quantidade ?? 0));
    if (stockError) {
      const produto = productById[stockError.produtoId];
      setFormError(`Estoque insuficiente para ${produto?.nome || `Produto ${stockError.produtoId}`}.`);
      return;
    }

    setSaving(true);

    const createResult = await createAdminPedido(
      {
        emNomeProprio,
        usuarioId: emNomeProprio ? undefined : parseIntInput(usuarioId),
        itens: pendingItems,
      },
      token
    );

    if (!createResult.ok) {
      setSaving(false);
      setFormError(getApiErrorMessage(createResult?.data, "Não foi possível criar o pedido."));
      return;
    }

    if (!createResult?.data?.data?.id) {
      setSaving(false);
      setFormError("Resposta inválida ao criar pedido.");
      return;
    }

    setSaving(false);
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

        <View style={styles.toolbar}>
          <TouchableOpacity style={styles.primaryButton} onPress={openModal}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.primaryButtonText}>Novo pedido</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={loadData} disabled={loading}>
            <Ionicons name="refresh-outline" size={17} color="#dbe9ff" />
          </TouchableOpacity>
        </View>

        <ListControls
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Buscar por pedido, usuário, produto..."
          sort={sort}
          onSortChange={setSort}
          sortFields={[
            { label: "Data", value: "data", type: "date" },
            { label: "Total", value: "total", type: "number" },
            { label: "Usuário", value: "usuario", type: "text" },
            { label: "ID", value: "id", type: "number" },
          ]}
          textFilters={pedidoTextFilters}
          filters={pedidoFilters}
          resultCount={filteredPedidos.length}
          totalCount={pedidos.length}
        />

        <View style={styles.listCard}>
          {loading ? (
            <Text style={styles.infoText}>Carregando pedidos...</Text>
          ) : filteredPedidos.length === 0 ? (
            <Text style={styles.infoText}>Nenhum pedido encontrado.</Text>
          ) : (
            filteredPedidos.map((pedido) => {
              const usuario = usersById[pedido.usuarioId];
              const itens = itensMap[pedido.id] || [];
              const totalPedido = getPedidoTotal(itens);
              return (
                <View key={pedido.id} style={styles.itemCard}>
                  <View style={{ flex: 1, gap: 3 }}>
                    <View style={styles.itemHeader}>
                      <Text style={styles.itemTitle}>Pedido #{pedido.id}</Text>
                      <Text style={styles.totalBadge}>{formatMoney(totalPedido)}</Text>
                    </View>
                    <Text style={styles.itemSubtitle}>Usuário: {usuario ? `${usuario.nome} (${usuario.id})` : pedido.usuarioId}</Text>
                    <Text style={styles.itemSubtitle}>Data: {new Date(pedido.dataPedido).toLocaleString("pt-BR")}</Text>
                    <Text style={styles.itemSubtitle}>Itens: {itens.length}</Text>
                    {itens.map((item) => (
                      <Text key={item.id} style={styles.itemDetail}>
                        • {productById[item.produtoId]?.nome || `Produto ${item.produtoId}`} x {item.quantidade} · {formatMoney(getLineTotal(item.produtoId, item.quantidade))}
                      </Text>
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

            <TouchableOpacity style={styles.toggleButton} onPress={() => setEmNomeProprio((v) => !v)} disabled={saving}>
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
            {selectedProduto && (
              <View style={styles.productMetaRow}>
                <Text style={styles.productMeta}>Estoque {selectedProduto.quantidade}</Text>
                <Text style={styles.productMeta}>{formatMoney(selectedProduto.preco)}</Text>
              </View>
            )}
            <TextInput
              style={styles.input}
              placeholder="Quantidade"
              placeholderTextColor="#98abc9"
              keyboardType="number-pad"
              value={newItem.quantidade}
              onChangeText={(v) => setNewItem((p) => ({ ...p, quantidade: v }))}
            />
            <TouchableOpacity style={styles.secondaryButton} onPress={addPendingItem} disabled={saving}>
              <Ionicons name="add-outline" size={16} color="#eaf2ff" />
              <Text style={styles.secondaryButtonText}>Adicionar item</Text>
            </TouchableOpacity>

            {pendingItems.length > 0 && (
              <View style={styles.pendingBox}>
                <View style={styles.pendingSummary}>
                  <Text style={styles.sectionTitle}>Itens do pedido</Text>
                  <Text style={styles.totalBadge}>{formatMoney(pendingTotal)}</Text>
                </View>
                {pendingItems.map((item, index) => (
                  <View key={`${item.produtoId}-${index}`} style={styles.pendingRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pendingText}>{productById[item.produtoId]?.nome || `Produto ${item.produtoId}`} x {item.quantidade}</Text>
                      <Text style={styles.pendingSubtext}>
                        Estoque {productById[item.produtoId]?.quantidade ?? 0} • {formatMoney(getLineTotal(item.produtoId, item.quantidade))}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => removePendingItem(index)} disabled={saving}>
                      <Ionicons name="close-circle-outline" size={18} color="#ffb0b0" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {!!formError && <Text style={styles.errorText}>{formError}</Text>}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={closeModal} disabled={saving}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSave, !canCreatePedido && { opacity: 0.55 }]}
                onPress={handleCreatePedido}
                disabled={!canCreatePedido}
              >
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
  toolbar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  primaryButton: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1d67e0", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14, alignSelf: "flex-start" },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  refreshButton: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(26, 72, 130, 0.6)", borderWidth: 1, borderColor: "rgba(138, 180, 248, 0.35)" },
  listCard: { borderWidth: 1, borderColor: "rgba(138,180,248,0.20)", backgroundColor: "rgba(13, 32, 53, 0.88)", borderRadius: 16, padding: 14, gap: 10 },
  infoText: { color: "#b7c8e8", fontSize: 14 },
  itemCard: { borderWidth: 1, borderColor: "rgba(138,180,248,0.20)", backgroundColor: "rgba(20, 56, 99, 0.55)", borderRadius: 12, padding: 12, flexDirection: "row", justifyContent: "space-between", gap: 10 },
  itemHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  itemTitle: { color: "#f4f8ff", fontSize: 15, fontWeight: "700" },
  totalBadge: { color: "#ecf7ff", fontSize: 12, fontWeight: "700", borderRadius: 10, overflow: "hidden", backgroundColor: "rgba(34, 125, 106, 0.42)", paddingHorizontal: 9, paddingVertical: 4 },
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
  productMetaRow: { flexDirection: "row", gap: 8, alignItems: "center" },
  productMeta: { color: "#b7c8e8", fontSize: 12, borderWidth: 1, borderColor: "rgba(138,180,248,0.20)", borderRadius: 9, paddingHorizontal: 8, paddingVertical: 4 },
  toggleButton: { borderRadius: 10, borderWidth: 1, borderColor: "rgba(138,180,248,0.35)", backgroundColor: "rgba(20, 56, 99, 0.35)", paddingVertical: 10, paddingHorizontal: 12 },
  toggleText: { color: "#dbe9ff", fontWeight: "700", fontSize: 12 },
  secondaryButton: { borderRadius: 10, borderWidth: 1, borderColor: "rgba(138,180,248,0.35)", backgroundColor: "rgba(33, 87, 155, 0.45)", paddingVertical: 10, paddingHorizontal: 12, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 6 },
  secondaryButtonText: { color: "#eaf2ff", fontWeight: "700", fontSize: 12 },
  pendingBox: { borderWidth: 1, borderColor: "rgba(138,180,248,0.22)", borderRadius: 10, padding: 8, gap: 6, backgroundColor: "rgba(20, 56, 99, 0.35)" },
  pendingSummary: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  pendingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  pendingText: { color: "#cddcf5", fontSize: 12 },
  pendingSubtext: { color: "#8fb1e0", fontSize: 11, marginTop: 2 },
  errorText: { color: "#ffb0b0", fontSize: 13, lineHeight: 18 },
  modalActions: { marginTop: 4, flexDirection: "row", justifyContent: "flex-end", gap: 10 },
  modalCancel: { borderRadius: 10, borderWidth: 1, borderColor: "rgba(138,180,248,0.35)", paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "rgba(20, 56, 99, 0.35)" },
  modalCancelText: { color: "#dbe9ff", fontWeight: "700" },
  modalSave: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#1d67e0" },
  modalSaveText: { color: "#fff", fontWeight: "700" },
  modalDelete: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, backgroundColor: "#c73939" },
  modalDeleteText: { color: "#fff", fontWeight: "700" },
});
