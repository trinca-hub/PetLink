import React, { useCallback, useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { AuthContext } from "@/src/context/AuthContext";
import { useSideMenu } from "@/src/context/SideMenuContext";
import { getProdutos } from "@/src/api/produtoService";
import {
  CartProductItem,
  getCartProducts,
  removeCartProduct,
  setCartProducts,
} from "@/src/storage/cartProducts";
import { checkoutFromItems } from "@/src/services/checkoutService";
import {
  EnderecoUsuario,
  atualizarEnderecoUsuario,
  criarEnderecoUsuario,
  definirEnderecoPrincipal,
  getEnderecosUsuario,
  removerEnderecoUsuario,
} from "@/src/api/enderecoService";
import { TutorPalette } from "@/constants/theme";

type ProdutoDTO = {
  id: number;
  nome: string;
  preco: number;
  quantidade?: number;
  foto?: string;
};

type AddressForm = {
  id?: number;
  apelido: string;
  destinatario: string;
  telefone: string;
  cep: string;
  uf: string;
  cidade: string;
  bairro: string;
  rua: string;
  numero: string;
  complemento: string;
  referencia: string;
  principal: boolean;
};

const emptyAddressForm: AddressForm = {
  apelido: "Casa",
  destinatario: "",
  telefone: "",
  cep: "",
  uf: "",
  cidade: "",
  bairro: "",
  rua: "",
  numero: "",
  complemento: "",
  referencia: "",
  principal: true,
};

function formatMoneyBR(valor?: number) {
  if (valor == null || Number.isNaN(valor)) return "";
  const s = Number(valor).toFixed(2).replace(".", ",");
  return `R$ ${s}`;
}

function summarizeFailures(names: string[]) {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  return `${names.slice(0, 2).join(", ")}${names.length > 2 ? "..." : ""}`;
}

function normalizeAddressList(payload: any): EnderecoUsuario[] {
  const list = Array.isArray(payload?.data?.data) ? payload.data.data : [];
  return list.map((item: any) => ({
    ...item,
    id: Number(item.id),
    usuarioId: Number(item.usuarioId),
    numero: Number(item.numero),
    principal: Boolean(item.principal),
  }));
}

function formatAddress(address?: EnderecoUsuario | null) {
  if (!address) return "Nenhum endereço selecionado";
  return `${address.rua}, ${address.numero}${address.complemento ? ` - ${address.complemento}` : ""}`;
}

export default function Carrinho() {
  const { token, user } = useContext(AuthContext);
  const { openMenu } = useSideMenu();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);

  const [produtos, setProdutos] = useState<ProdutoDTO[]>([]);
  const [cartItems, setCartItems] = useState<CartProductItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [addresses, setAddresses] = useState<EnderecoUsuario[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressForm, setAddressForm] = useState<AddressForm>(emptyAddressForm);

  const selectedAddress = addresses.find((item) => item.id === selectedAddressId) ?? null;

  function getEstoqueAtual(produtoId: number) {
    const p = produtos.find((x) => x.id === produtoId);
    return Number(p?.quantidade ?? 0);
  }

  function isUnavailable(item: CartProductItem) {
    const estoque = Number(item.estoque ?? getEstoqueAtual(item.produtoId));
    return estoque <= 0 || Number(item.quantidade) <= 0;
  }

  const loadAddresses = useCallback(async () => {
    if (!user?.id || !token) {
      setAddresses([]);
      setSelectedAddressId(null);
      return;
    }

    const res = await getEnderecosUsuario(user.id, token);
    const list = normalizeAddressList(res);
    setAddresses(list);

    const principal = list.find((item) => item.principal) ?? list[0];
    setSelectedAddressId((prev) => {
      if (prev && list.some((item) => item.id === prev)) return prev;
      return principal?.id ?? null;
    });
  }, [user?.id, token]);

  const load = useCallback(async () => {
    if (!user?.id) {
      setCartItems([]);
      setSelectedIds([]);
      setLoading(false);
      return;
    }

    setError(null);
    const res: any = await getProdutos(token || undefined);
    if (!res?.ok) {
      setError(res?.data?.message || "Erro ao buscar produtos");
    }

    const list = Array.isArray(res?.data?.data) ? res.data.data : [];
    setProdutos(list);

    const items = await getCartProducts(user.id);
    const withStock = items.map((it: CartProductItem) => {
      const estoqueAtual = Number(it.estoque ?? list.find((p: ProdutoDTO) => p.id === it.produtoId)?.quantidade ?? 0);
      const quantidadeInformada = Number(it.quantidade ?? 1);
      const quantidadeAtual =
        estoqueAtual <= 0
          ? 0
          : Math.min(Math.max(1, quantidadeInformada || 1), estoqueAtual);

      return {
        ...it,
        estoque: estoqueAtual,
        quantidade: quantidadeAtual,
      };
    });

    await setCartProducts(user.id, withStock);
    setCartItems(withStock);
    setSelectedIds(withStock.filter((x) => Number(x.estoque) > 0 && Number(x.quantidade) > 0).map((x) => x.produtoId));
    await loadAddresses();
    setLoading(false);
  }, [loadAddresses, token, user?.id]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        setLoading(true);
        await load();
        if (isActive) setLoading(false);
      })();
      return () => {
        isActive = false;
      };
    }, [load])
  );

  function toggleSelect(produtoId: number) {
    setSelectedIds((prev) =>
      prev.includes(produtoId) ? prev.filter((id) => id !== produtoId) : [...prev, produtoId]
    );
  }

  async function decQty(produtoId: number) {
    if (!user?.id) return;

    const next = cartItems.map((x) => {
      if (x.produtoId !== produtoId) return x;
      const estoque = Number(x.estoque ?? getEstoqueAtual(x.produtoId));
      if (estoque <= 0) return { ...x, estoque, quantidade: 0 };
      return { ...x, estoque, quantidade: Math.max(1, Number(x.quantidade) - 1) };
    });

    setCartItems(next);
    await setCartProducts(user.id, next);
  }

  async function incQty(produtoId: number) {
    if (!user?.id) return;

    const next = cartItems.map((x) => {
      if (x.produtoId !== produtoId) return x;
      const estoque = Number(x.estoque ?? getEstoqueAtual(x.produtoId));
      if (estoque <= 0) return { ...x, estoque, quantidade: 0 };
      const nextQty = Math.min(Number(x.quantidade ?? 1) + 1, estoque);
      return { ...x, estoque, quantidade: nextQty };
    });

    setCartItems(next);
    await setCartProducts(user.id, next);
  }

  async function removeItem(produtoId: number) {
    if (!user?.id) return;
    const next = await removeCartProduct(user.id, produtoId);
    setCartItems(next);
    setSelectedIds((prev) => prev.filter((id) => id !== produtoId));
  }

  const totalSelecionado = useMemo(() => {
    return cartItems
      .filter((x) => selectedIds.includes(x.produtoId) && Number(x.quantidade) > 0)
      .reduce((sum, x) => sum + Number(x.preco) * Number(x.quantidade), 0);
  }, [cartItems, selectedIds]);

  function openNewAddress() {
    setAddressForm({
      ...emptyAddressForm,
      destinatario: user?.nome ?? "",
      principal: addresses.length === 0,
    });
    setAddressModalOpen(true);
  }

  function openEditAddress(address: EnderecoUsuario) {
    setAddressForm({
      id: address.id,
      apelido: address.apelido || "Entrega",
      destinatario: address.destinatario || user?.nome || "",
      telefone: address.telefone || "",
      cep: address.cep || "",
      uf: address.uf || "",
      cidade: address.cidade || "",
      bairro: address.bairro || "",
      rua: address.rua || "",
      numero: String(address.numero || ""),
      complemento: address.complemento || "",
      referencia: address.referencia || "",
      principal: Boolean(address.principal),
    });
    setAddressModalOpen(true);
  }

  function updateAddressField(key: keyof AddressForm, value: string | boolean) {
    setAddressForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildAddressPayload(): EnderecoUsuario | null {
    if (!user?.id) return null;
    const numero = Number(addressForm.numero);

    if (
      !addressForm.cep.trim() ||
      !addressForm.uf.trim() ||
      !addressForm.cidade.trim() ||
      !addressForm.bairro.trim() ||
      !addressForm.rua.trim() ||
      !numero
    ) {
      Alert.alert("Endereço", "Preencha CEP, UF, cidade, bairro, rua e número.");
      return null;
    }

    return {
      id: addressForm.id,
      usuarioId: user.id,
      apelido: addressForm.apelido.trim() || "Entrega",
      destinatario: addressForm.destinatario.trim() || user.nome || "Destinatário",
      telefone: addressForm.telefone.trim(),
      cep: addressForm.cep.trim(),
      uf: addressForm.uf.trim().toUpperCase(),
      cidade: addressForm.cidade.trim(),
      bairro: addressForm.bairro.trim(),
      rua: addressForm.rua.trim(),
      numero,
      complemento: addressForm.complemento.trim(),
      referencia: addressForm.referencia.trim(),
      principal: addressForm.principal,
      ativo: true,
    };
  }

  async function saveAddress() {
    if (!token) return;
    const payload = buildAddressPayload();
    if (!payload) return;

    setSavingAddress(true);
    const res = payload.id
      ? await atualizarEnderecoUsuario(payload.id, payload, token)
      : await criarEnderecoUsuario(payload, token);
    setSavingAddress(false);

    if (!res.ok) {
      Alert.alert("Endereço", res?.data?.message || "Não foi possível salvar o endereço.");
      return;
    }

    setAddressModalOpen(false);
    await loadAddresses();
  }

  async function choosePrincipal(address: EnderecoUsuario) {
    if (!token || !address.id) return;
    setSelectedAddressId(address.id);
    const res = await definirEnderecoPrincipal(address.id, token);
    if (!res.ok) {
      Alert.alert("Endereço", res?.data?.message || "Não foi possível definir o principal.");
      return;
    }
    await loadAddresses();
  }

  async function deleteAddress(address: EnderecoUsuario) {
    if (!token || !address.id) return;

    Alert.alert("Remover endereço", `Remover ${address.apelido || "este endereço"}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Remover",
        style: "destructive",
        onPress: async () => {
          const res = await removerEnderecoUsuario(address.id!, token);
          if (!res.ok) {
            Alert.alert("Endereço", res?.data?.message || "Não foi possível remover.");
            return;
          }
          await loadAddresses();
        },
      },
    ]);
  }

  async function finalizarCompraSelecionados() {
    if (!user?.id || !token) return Alert.alert("Login", "Faça login para comprar.");
    if (!selectedAddressId) return Alert.alert("Endereço de entrega", "Cadastre ou selecione um endereço para continuar.");

    const initiallySelected = cartItems.filter((x) => selectedIds.includes(x.produtoId));
    if (initiallySelected.length === 0) return Alert.alert("Carrinho", "Selecione pelo menos 1 produto.");

    const withStock = initiallySelected.map((item) => {
      const estoqueAtual = Number(item.estoque ?? getEstoqueAtual(item.produtoId));
      const quantidadeAtual = Math.min(Math.max(1, Number(item.quantidade ?? 1)), estoqueAtual || 0);
      return {
        ...item,
        estoque: estoqueAtual,
        quantidade: estoqueAtual <= 0 ? 0 : quantidadeAtual,
      };
    });

    const validItems = withStock.filter((x) => Number(x.quantidade) > 0 && Number(x.estoque) > 0);
    if (validItems.length === 0) {
      return Alert.alert("Carrinho", "Nenhum item válido restou selecionado para finalizar.");
    }

    setBuying(true);

    try {
      const checkout = await checkoutFromItems(
        user.id,
        token,
        validItems.map((x) => ({
          produtoId: x.produtoId,
          nome: x.nome,
          preco: x.preco,
          foto: x.foto,
          quantidade: Number(x.quantidade),
        })),
        selectedAddressId
      );

      const confirmedIds = new Set(checkout.confirmedItems.map((item) => item.produtoId));
      const remaining = cartItems.filter((item) => !confirmedIds.has(item.produtoId));
      setCartItems(remaining);
      await setCartProducts(user.id, remaining);

      if (!checkout.ok) {
        const msg = checkout.generalError || "Falha ao concluir compra dos itens selecionados.";
        Alert.alert("Erro", msg);
        return;
      }

      if (checkout.status === "partial") {
        const failedNames = checkout.failedItems.map((f) => f.item.nome);
        Alert.alert(
          "Compra parcial",
          `Itens confirmados: ${checkout.confirmedItems.length}. Falhas em: ${summarizeFailures(failedNames)}`
        );
      } else {
        Alert.alert("Sucesso", "Compra realizada com sucesso!");
      }

      setSelectedIds(remaining.filter((x) => !isUnavailable(x)).map((x) => x.produtoId));
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível finalizar sua compra.");
    } finally {
      setBuying(false);
    }
  }

  function renderAddressCard(address: EnderecoUsuario) {
    const checked = selectedAddressId === address.id;

    return (
      <Pressable
        key={address.id}
        onPress={() => setSelectedAddressId(address.id ?? null)}
        style={{
          padding: 12,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: checked ? TutorPalette.primary : "rgba(0,0,0,0.08)",
          backgroundColor: checked ? "rgba(47,124,246,0.08)" : "#fff",
          marginBottom: 10,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: TutorPalette.background, fontWeight: "900" }}>
              {address.apelido || "Entrega"} {address.principal ? "• Principal" : ""}
            </Text>
            <Text style={{ color: TutorPalette.muted, fontWeight: "700", marginTop: 4 }}>
              {formatAddress(address)}
            </Text>
            <Text style={{ color: TutorPalette.muted, marginTop: 2, fontSize: 12 }}>
              {address.bairro}, {address.cidade} - {address.uf}
            </Text>
          </View>

          <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: checked ? TutorPalette.primary : "rgba(0,0,0,0.2)", alignItems: "center", justifyContent: "center" }}>
            {checked ? <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: TutorPalette.primary }} /> : null}
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 14, marginTop: 10 }}>
          <Pressable onPress={() => openEditAddress(address)}>
            <Text style={{ color: TutorPalette.primary, fontWeight: "900" }}>Editar</Text>
          </Pressable>
          {!address.principal ? (
            <Pressable onPress={() => choosePrincipal(address)}>
              <Text style={{ color: TutorPalette.primary, fontWeight: "900" }}>Tornar principal</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => deleteAddress(address)}>
            <Text style={{ color: TutorPalette.danger, fontWeight: "900" }}>Remover</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  }

  return (
    <LinearGradient colors={[TutorPalette.background, TutorPalette.backgroundSecondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingTop: 14, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={openMenu} style={{ width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.10)" }}>
            <Feather name="menu" size={22} color="#fff" />
          </Pressable>

          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800" }}>PetLink</Text>

          <Pressable onPress={() => router.push("/perfil")} style={{ width: 42, height: 42, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="person" size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          <View style={{ backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 20, padding: 14, borderWidth: 1, borderColor: TutorPalette.border }}>
            <Text style={{ color: TutorPalette.text, fontSize: 18, fontWeight: "900" }}>Carrinho</Text>
            <Text style={{ color: TutorPalette.muted, fontSize: 13, marginTop: 4 }}>Selecione produtos e endereço de entrega antes de finalizar.</Text>
          </View>
        </View>

        <View style={{ marginTop: 14, marginHorizontal: 16, backgroundColor: "rgba(245,247,255,0.96)", borderRadius: 22, padding: 14, flex: 1, shadowColor: TutorPalette.shadow, shadowOpacity: 0.16, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 4 }}>
          {loading ? (
            <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
              <ActivityIndicator size="large" color={TutorPalette.primary} />
              <Text style={{ marginTop: 10, fontWeight: "800", color: TutorPalette.surface }}>Carregando carrinho...</Text>
            </View>
          ) : error ? (
            <View style={{ paddingTop: 8 }}>
              <Text style={{ color: TutorPalette.danger, fontWeight: "800" }}>{error}</Text>
            </View>
          ) : cartItems.length === 0 ? (
            <View style={{ paddingTop: 16 }}>
              <Text style={{ fontWeight: "900", color: TutorPalette.background }}>Seu carrinho está vazio.</Text>
              <Text style={{ marginTop: 6, color: TutorPalette.muted, fontWeight: "700" }}>Adicione produtos para comprar.</Text>
            </View>
          ) : (
            <FlatList
              data={cartItems}
              keyExtractor={(i) => String(i.produtoId)}
              contentContainerStyle={{ paddingBottom: 186 }}
              ListHeaderComponent={
                <View style={{ marginBottom: 10 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <Text style={{ color: TutorPalette.background, fontWeight: "900", fontSize: 16 }}>Entrega</Text>
                    <Pressable onPress={openNewAddress} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="add-circle-outline" size={18} color={TutorPalette.primary} />
                      <Text style={{ color: TutorPalette.primary, fontWeight: "900" }}>Novo endereço</Text>
                    </Pressable>
                  </View>

                  {addresses.length === 0 ? (
                    <Pressable onPress={openNewAddress} style={{ borderRadius: 16, padding: 14, borderWidth: 1, borderColor: "rgba(47,124,246,0.25)", backgroundColor: "rgba(47,124,246,0.08)" }}>
                      <Text style={{ color: TutorPalette.background, fontWeight: "900" }}>Cadastre um endereço para continuar</Text>
                      <Text style={{ color: TutorPalette.muted, marginTop: 4, fontWeight: "700" }}>Você poderá salvar como principal e usar outros endereços depois.</Text>
                    </Pressable>
                  ) : (
                    addresses.map(renderAddressCard)
                  )}
                </View>
              }
              renderItem={({ item }) => {
                const checked = selectedIds.includes(item.produtoId);
                const estoque = Number(item.estoque ?? getEstoqueAtual(item.produtoId));
                const indisponivel = estoque <= 0 || Number(item.quantidade) <= 0;
                const travado = Number(item.quantidade) >= estoque;

                return (
                  <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "rgba(0,0,0,0.06)" }}>
                    <Pressable onPress={() => { if (!indisponivel) toggleSelect(item.produtoId); }} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={{ width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: indisponivel ? "rgba(0,0,0,0.12)" : checked ? TutorPalette.primary : "rgba(0,0,0,0.25)", backgroundColor: checked ? "rgba(47,124,246,0.12)" : "transparent", alignItems: "center", justifyContent: "center" }}>
                        {checked && <Ionicons name="checkmark" size={18} color={TutorPalette.primary} />}
                      </View>

                      <View style={{ width: 56, height: 56, borderRadius: 12, overflow: "hidden", backgroundColor: "#F2F2F7", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" }}>
                        {!!item.foto ? (
                          <Image source={{ uri: item.foto }} style={{ width: "100%", height: "100%" }} resizeMode="contain" />
                        ) : (
                          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                            <Ionicons name="image" size={18} color="#999" />
                          </View>
                        )}
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={{ fontWeight: "900", color: TutorPalette.background }}>{item.nome}</Text>
                        <Text style={{ marginTop: 4, fontWeight: "900", color: TutorPalette.primary }}>{formatMoneyBR(item.preco)}</Text>
                        <Text style={{ marginTop: 2, fontWeight: "700", color: TutorPalette.muted, fontSize: 12 }}>Em estoque: {estoque}</Text>
                      </View>
                    </Pressable>

                    <View style={{ marginTop: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <Pressable onPress={() => decQty(item.produtoId)} disabled={indisponivel || Number(item.quantidade) <= 1} style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: indisponivel || Number(item.quantidade) <= 1 ? "rgba(0,0,0,0.03)" : "rgba(47,124,246,0.12)", alignItems: "center", justifyContent: "center", opacity: indisponivel || Number(item.quantidade) <= 1 ? 0.6 : 1 }}>
                          <Ionicons name="remove" size={18} color={TutorPalette.primary} />
                        </Pressable>

                        <Text style={{ minWidth: 22, textAlign: "center", fontWeight: "900", color: TutorPalette.background }}>{item.quantidade}</Text>

                        <Pressable onPress={() => incQty(item.produtoId)} disabled={indisponivel || travado || estoque <= 0} style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: indisponivel || travado || estoque <= 0 ? "rgba(0,0,0,0.03)" : "rgba(47,124,246,0.14)", borderWidth: 1, borderColor: indisponivel || travado || estoque <= 0 ? "rgba(0,0,0,0.08)" : "rgba(47,124,246,0.4)", alignItems: "center", justifyContent: "center", opacity: indisponivel || travado || estoque <= 0 ? 0.6 : 1 }}>
                          <Ionicons name="add" size={18} color={TutorPalette.primary} />
                        </Pressable>
                      </View>

                      {indisponivel ? (
                        <Text style={{ fontSize: 12, fontWeight: "800", color: TutorPalette.danger }}>Indisponível</Text>
                      ) : travado && estoque > 0 ? (
                        <Text style={{ fontSize: 12, fontWeight: "800", color: TutorPalette.danger }}>Limite do estoque</Text>
                      ) : null}
                    </View>

                    <Pressable onPress={() => removeItem(item.produtoId)} style={{ marginTop: 8, alignSelf: "flex-end", flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Ionicons name="trash-outline" size={16} color={TutorPalette.danger} />
                      <Text style={{ color: TutorPalette.danger, fontWeight: "800", fontSize: 12 }}>Remover</Text>
                    </Pressable>
                  </View>
                );
              }}
            />
          )}

          <View style={{ position: "absolute", left: 14, right: 14, bottom: 14, backgroundColor: "rgba(255,255,255,0.94)", paddingTop: 10, borderRadius: 16, paddingHorizontal: 12, paddingBottom: 12 }}>
            <Text numberOfLines={1} style={{ color: TutorPalette.muted, fontWeight: "800", fontSize: 12 }}>
              Entrega: {selectedAddress ? formatAddress(selectedAddress) : "cadastre ou selecione um endereço"}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
              <Text style={{ fontWeight: "900", color: TutorPalette.background }}>Total selecionado</Text>
              <Text style={{ fontWeight: "900", color: TutorPalette.primary, fontSize: 16 }}>{formatMoneyBR(totalSelecionado)}</Text>
            </View>

            <Pressable disabled={buying || selectedIds.length === 0} onPress={finalizarCompraSelecionados} style={{ marginTop: 10, backgroundColor: buying || selectedIds.length === 0 ? "rgba(47,124,246,0.35)" : TutorPalette.primary, borderRadius: 999, paddingVertical: 12, alignItems: "center", justifyContent: "center" }}>
              {buying ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "900" }}>Finalizar compra</Text>}
            </Pressable>
          </View>
        </View>

        <Modal visible={addressModalOpen} transparent animationType="slide" onRequestClose={() => setAddressModalOpen(false)}>
          <View style={{ flex: 1, backgroundColor: "rgba(5,10,18,0.52)", justifyContent: "flex-end" }}>
            <View style={{ maxHeight: "88%", backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 18 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <Text style={{ color: TutorPalette.background, fontWeight: "900", fontSize: 18 }}>
                  {addressForm.id ? "Editar endereço" : "Novo endereço"}
                </Text>
                <Pressable onPress={() => setAddressModalOpen(false)} style={{ width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.05)" }}>
                  <Ionicons name="close" size={20} color={TutorPalette.background} />
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
                {[
                  ["apelido", "Apelido", "Casa, trabalho..."],
                  ["destinatario", "Destinatário", "Quem vai receber"],
                  ["telefone", "Telefone", "Contato para entrega"],
                  ["cep", "CEP", "00000000"],
                  ["uf", "UF", "SP"],
                  ["cidade", "Cidade", "Sua cidade"],
                  ["bairro", "Bairro", "Seu bairro"],
                  ["rua", "Rua", "Nome da rua"],
                  ["numero", "Número", "Número"],
                  ["complemento", "Complemento", "Apto, bloco..."],
                  ["referencia", "Referência", "Ponto de referência"],
                ].map(([key, label, placeholder]) => (
                  <View key={key} style={{ marginBottom: 10 }}>
                    <Text style={{ color: TutorPalette.background, fontWeight: "800", marginBottom: 6 }}>{label}</Text>
                    <TextInput
                      value={String(addressForm[key as keyof AddressForm] ?? "")}
                      onChangeText={(value) => updateAddressField(key as keyof AddressForm, value)}
                      placeholder={placeholder}
                      placeholderTextColor="#99A3B3"
                      keyboardType={key === "numero" || key === "cep" || key === "telefone" ? "numeric" : "default"}
                      autoCapitalize={key === "uf" ? "characters" : "sentences"}
                      style={{ height: 46, borderRadius: 14, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)", paddingHorizontal: 12, color: TutorPalette.background, backgroundColor: "#F7F9FC" }}
                    />
                  </View>
                ))}

                <Pressable onPress={() => updateAddressField("principal", !addressForm.principal)} style={{ flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 }}>
                  <View style={{ width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: addressForm.principal ? TutorPalette.primary : "rgba(0,0,0,0.2)", alignItems: "center", justifyContent: "center" }}>
                    {addressForm.principal ? <Ionicons name="checkmark" size={16} color={TutorPalette.primary} /> : null}
                  </View>
                  <Text style={{ color: TutorPalette.background, fontWeight: "900" }}>Usar como endereço principal</Text>
                </Pressable>

                <Pressable onPress={saveAddress} disabled={savingAddress} style={{ marginTop: 12, borderRadius: 999, backgroundColor: TutorPalette.primary, paddingVertical: 13, alignItems: "center" }}>
                  {savingAddress ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontWeight: "900" }}>Salvar endereço</Text>}
                </Pressable>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}
