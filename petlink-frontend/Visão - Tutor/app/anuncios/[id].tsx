import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    Pressable,
    ActivityIndicator,
    Image,
    ScrollView,
    Alert,
    useWindowDimensions,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { AuthContext } from "@/src/context/AuthContext";
import { api } from "@/src/api/api";

// se você já tiver essas funções no anuncioService, pode usar elas.
// aqui eu usei api direto pra não depender do arquivo.
type AnuncioBaseDTO = {
    id: number;
    descricao: string;
    tipoAnuncio: number; // 1 PETINDER, 2 PETFINDER, 3 PAYPET
    usuarioId: number;
};

type AnuncioDetalhe = {
    anuncioId: number;

    descricao?: string;
    dataCriacao?: string;

    fotoPet?: string;
    nomePet?: string;
    idadePet?: string;
    sexoPet?: string;
    racaPet?: string;
    tipoPet?: string;

    nomeUsuario?: string;
    telefoneUsuario?: string;

    cidade?: string;
    uf?: string;
    bairro?: string;
    rua?: string;
    numero?: number;

    // extras possíveis
    ultimoLocalVisto?: string;
    dataDesaparecimento?: string;
    valor?: number;
};

function formatSexo(sexo?: string) {
    const s = String(sexo ?? "").toLowerCase().trim();
    if (!s) return "Não informado";
    if (s === "m" || s === "macho") return "Macho";
    if (s === "f" || s === "femea" || s === "fêmea") return "Fêmea";
    return sexo!;
}

function tipoToFeedPath(tipoAnuncio: number) {
    if (tipoAnuncio === 2) return "Anuncio/feed/petfinder";
    if (tipoAnuncio === 3) return "Anuncio/feed/paypet";
    return "Anuncio/feed/petinder";
}

function tipoToTitulo(tipoAnuncio: number) {
    if (tipoAnuncio === 2) return "PetFinder";
    if (tipoAnuncio === 3) return "PayPet";
    return "PeTinder";
}

export default function AnuncioDetalheScreen() {
    const { token, user } = useContext(AuthContext);

    const params = useLocalSearchParams<{ id?: string }>();
    const id = useMemo(() => Number(params.id), [params.id]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [base, setBase] = useState<AnuncioBaseDTO | null>(null);
    const [data, setData] = useState<AnuncioDetalhe | null>(null);

    const { width } = useWindowDimensions();
    const imageW = width - 32; // 16 de padding em cada lado
    const [imageH, setImageH] = useState<number>(240);


    const titulo = useMemo(() => (base ? tipoToTitulo(base.tipoAnuncio) : "Anúncio"), [base]);

    const isOwner = useMemo(() => {
        if (!user?.id) return false;
        if (!base?.usuarioId) return false;
        return Number(base.usuarioId) === Number(user.id);
    }, [base?.usuarioId, user?.id]);


    async function load() {
        setError(null);
        setData(null);

        // 1) pega o anuncio base (tem tipoAnuncio e descricao)
        const resBase: any = await api(`Anuncio/${id}`, "GET", undefined, token || undefined);

        if (!resBase?.ok) {
            setError(resBase?.data?.message || "Não foi possível carregar o anúncio.");
            return;
        }

        const baseDto = (resBase?.data?.data ?? resBase?.data) as any;
        const baseParsed: AnuncioBaseDTO = {
            id: baseDto.id ?? baseDto.Id ?? id,
            descricao: baseDto.descricao ?? "",
            tipoAnuncio: baseDto.tipoAnuncio ?? baseDto.TipoAnuncio ?? 1,
            usuarioId: baseDto.usuarioId ?? baseDto.UsuarioId ?? 0,
        };
        setBase(baseParsed);

        // 2) com o tipoAnuncio, busca o feed certo (retorno completo)
        const feedPath = tipoToFeedPath(baseParsed.tipoAnuncio);
        const resFeed: any = await api(feedPath, "GET", undefined, token || undefined);

        if (!resFeed?.ok) {
            setError(resFeed?.data?.message || "Não foi possível carregar os dados completos do anúncio.");
            return;
        }

        const list = Array.isArray(resFeed?.data?.data) ? resFeed.data.data : [];
        const found = list.find((x: any) => Number(x.anuncioId) === Number(id));

        if (!found) {
            // se não achar no feed, pelo menos mostra a descrição base
            setData({
                anuncioId: id,
                descricao: baseParsed.descricao,
            });
            setError("Não encontrei esse anúncio no feed. (Mas a descrição base foi carregada)");
            return;
        }

        // 3) merge: usa o found (completo) e garante que descrição esteja preenchida
        setData({
            ...found,
            anuncioId: found.anuncioId ?? id,
            descricao: found.descricao ?? baseParsed.descricao,
        });
    }

    useEffect(() => {
        (async () => {
            if (!id || Number.isNaN(id)) {
                setError("ID inválido.");
                setLoading(false);
                return;
            }

            setLoading(true);
            await load();
            setLoading(false);
        })();
    }, [id]);

    const endereco = useMemo(() => {
        if (!data) return "";
        const parts = [
            data.rua ? `${data.rua}` : null,
            data.numero != null ? `nº ${data.numero}` : null,
            data.bairro ? data.bairro : null,
            data.cidade ? data.cidade : null,
            data.uf ? data.uf : null,
        ].filter(Boolean);
        return parts.join(" • ");
    }, [data]);

    const isVenda = Number(base?.tipoAnuncio) === 3 && Number(data?.tipoPayPet) === 2;
    const mostrarPreco = isVenda && Number(data?.valor ?? 0) > 0;

    const podeContato = !!data?.telefoneUsuario;


    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Carregando anúncio...</Text>
            </View>
        );
    }

    return (
        <LinearGradient
            colors={["#0B0B0F", "#0E2B5A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
        >
            {/* Header */}
            <View
                style={{
                    paddingTop: 14,
                    paddingHorizontal: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Pressable
                    onPress={() => router.back()}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Feather name="arrow-left" size={22} color="#fff" />
                </Pressable>

                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>{titulo}</Text>

                <Pressable
                    onPress={() => router.push("/perfil")}
                    style={{
                        width: 40,
                        height: 40,
                        borderRadius: 999,
                        backgroundColor: "rgba(255,255,255,0.12)",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Ionicons name="person" size={20} color="#fff" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
                {!!error && (
                    <View style={{ marginTop: 10 }}>
                        <Text style={{ color: "#ffb4b4", fontWeight: "900" }}>{error}</Text>
                    </View>
                )}

                {/* Foto principal */}
                <View style={{ marginTop: 14, borderRadius: 22, overflow: "hidden", backgroundColor: "#EEE" }}>
                    {!!data?.fotoPet ? (
                        <Image
                            source={{ uri: data.fotoPet }}
                            style={{ width: imageW, height: imageH }}
                            resizeMode="contain"
                            onLoad={({ nativeEvent }) => {
                                const { width: w, height: h } = nativeEvent.source;
                                if (w && h) setImageH(imageW * (h / w));
                            }}
                        />
                    ) : (
                        <View style={{ height: 240, alignItems: "center", justifyContent: "center" }}>
                            <Ionicons name="paw" size={44} color="#999" />
                            <Text style={{ marginTop: 8, color: "#666", fontWeight: "800" }}>Sem foto</Text>
                        </View>
                    )}
                </View>

                {/* Card */}
                <View
                    style={{
                        marginTop: 14,
                        backgroundColor: "#fff",
                        borderRadius: 22,
                        padding: 16,
                        shadowOpacity: 0.12,
                        shadowRadius: 10,
                        shadowOffset: { width: 0, height: 6 },
                        elevation: 4,
                    }}
                >
                    {/* Nome + raça */}
                    <Text style={{ fontSize: 22, fontWeight: "900", color: "#111", textAlign: "center" }}>
                        {data?.nomePet || "Pet"}
                    </Text>

                    <Text style={{ marginTop: 6, color: "#333", fontWeight: "800", textAlign: "center" }}>
                        {String(data?.tipoPet ?? "").toUpperCase() === "GATO" ? "Gato" : "Cachorro"}
                    </Text>

                    {/* Infos */}
                    <View style={{ marginTop: 14, gap: 10 }}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <MaterialCommunityIcons
                                name={
                                    Number(data?.tipoPet) === 1 ||
                                        String(data?.tipoPet ?? "").toUpperCase() === "GATO"
                                        ? "cat"
                                        : "dog"
                                }
                                size={18}
                                color="#0E2B5A"
                            />
                            <Text style={{ color: "#222", fontWeight: "700" }}>
                                {data?.racaPet || "R.N.D"}
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <MaterialCommunityIcons name="gender-male-female" size={18} color="#0E2B5A" />
                            <Text style={{ color: "#222", fontWeight: "800" }}>{formatSexo(data?.sexoPet)}</Text>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Ionicons name="calendar" size={18} color="#0E2B5A" />
                            <Text style={{ color: "#222", fontWeight: "800" }}>
                                {String(data?.idadePet ?? "").trim() ? String(data!.idadePet) : "Idade não informada"}
                            </Text>
                        </View>

                        {!!endereco && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <Ionicons name="map" size={18} color="#0E2B5A" />
                                <Text
                                    numberOfLines={4}
                                    ellipsizeMode="tail"
                                    style={{
                                        color: "#222",
                                        fontWeight: "800",
                                        flex: 1,          // ✅ não estoura o card
                                        paddingRight: 12, // ✅ “margem” no fim
                                    }}
                                >
                                    {endereco}
                                </Text>
                            </View>
                        )}


                        {/* Extras organizados por tipo */}
                        {base?.tipoAnuncio === 2 && ( // PetFinder
                            <>
                                {!!data?.ultimoLocalVisto && (
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                        <Ionicons name="pin" size={18} color="#0E2B5A" />
                                        <Text style={{ color: "#222", fontWeight: "800" }}>
                                            Último local visto: {data.ultimoLocalVisto}
                                        </Text>
                                    </View>
                                )}
                                {!!data?.dataDesaparecimento && (
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                        <Ionicons name="time" size={18} color="#0E2B5A" />
                                        <Text style={{ color: "#222", fontWeight: "800" }}>
                                            Desapareceu em: {new Date(String(data.dataDesaparecimento)).toLocaleDateString("pt-BR")}
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}

                        {base?.tipoAnuncio === 3 && mostrarPreco && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                                <Ionicons name="cash" size={18} color="#0E2B5A" />
                                <Text style={{ color: "#222", fontWeight: "800" }}>
                                    Valor: R$ {data?.valor}
                                </Text>
                            </View>
                        )}

                    </View>

                    {/* Descrição */}
                    <View style={{ marginTop: 16 }}>
                        <Text style={{ color: "#111", fontWeight: "900", marginBottom: 8 }}>Descrição</Text>
                        <Text style={{ color: "#333", fontWeight: "700", lineHeight: 20 }}>
                            {data?.descricao?.trim() ? data.descricao : "Sem descrição."}
                        </Text>
                    </View>

                    {/* Responsável */}
                    <View style={{ marginTop: 16 }}>
                        <Text style={{ color: "#111", fontWeight: "900", marginBottom: 8 }}>Responsável</Text>

                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                            <Ionicons name="person" size={18} color="#0E2B5A" />
                            <Text style={{ color: "#222", fontWeight: "800" }}>
                                {data?.nomeUsuario || "Não informado"}
                            </Text>
                        </View>

                        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 }}>
                            <Ionicons name="call" size={18} color="#0E2B5A" />
                            <Text style={{ color: "#222", fontWeight: "800" }}>
                                {data?.telefoneUsuario || "Telefone não disponível"}
                            </Text>
                        </View>
                    </View>

                    {/* Ações */}
                    <View style={{ marginTop: 18, gap: 10 }}>
                        <Pressable
                            disabled={!podeContato}
                            onPress={() => {
                                Alert.alert(
                                    "Contato",
                                    data?.telefoneUsuario ? `Telefone: ${data.telefoneUsuario}` : "Telefone não disponível."
                                );
                            }}
                            style={{
                                backgroundColor: podeContato ? "#0B3B91" : "rgba(11,59,145,0.35)",
                                borderRadius: 999,
                                paddingVertical: 14,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>
                                Contato do Tutor
                            </Text>
                        </Pressable>

                        {/* ✅ C: Só aparece pro dono */}
                        {isOwner && (
                            <View style={{ marginTop: 10, gap: 10 }}>
                                <Pressable
                                    onPress={() => router.push({ pathname: "/anuncios/editar", params: { id: String(id) } })}
                                    style={{
                                        backgroundColor: "#111",
                                        borderRadius: 999,
                                        paddingVertical: 14,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>Editar anúncio</Text>
                                </Pressable>

                                <Pressable
                                    onPress={() => {
                                        Alert.alert("Excluir anúncio", "Tem certeza que deseja excluir?", [
                                            { text: "Cancelar", style: "cancel" },
                                            {
                                                text: "Excluir",
                                                style: "destructive",
                                                onPress: async () => {
                                                    const res: any = await api(`Anuncio/${id}`, "DELETE", undefined, token || undefined);
                                                    if (!res?.ok) {
                                                        Alert.alert("Erro", res?.data?.message || "Não foi possível excluir.");
                                                        return;
                                                    }
                                                    Alert.alert("Sucesso", "Anúncio excluído!");
                                                    router.back();
                                                },
                                            },
                                        ]);
                                    }}
                                    style={{
                                        backgroundColor: "#FF3B30",
                                        borderRadius: 999,
                                        paddingVertical: 14,
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>Excluir anúncio</Text>
                                </Pressable>
                            </View>
                        )}


                        <Pressable
                            onPress={() => router.back()}
                            style={{
                                backgroundColor: "#1C66FF",
                                borderRadius: 999,
                                paddingVertical: 14,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 16 }}>Voltar</Text>
                        </Pressable>
                    </View>

                </View>
            </ScrollView>
        </LinearGradient>
    );
}
