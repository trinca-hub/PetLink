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
    StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

import { AuthContext } from "@/src/context/AuthContext";
import { api } from "@/src/api/api";
import { TutorPalette } from "@/constants/theme";

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
    tipoPayPet?: number;
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
    const [slideIndex, setSlideIndex] = useState(0);


    const titulo = useMemo(() => (base ? tipoToTitulo(base.tipoAnuncio) : "Anúncio"), [base]);

    const gallery = useMemo(() => {
        if (!data?.fotoPet) return [] as string[];
        return [data.fotoPet];
    }, [data?.fotoPet]);

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

    function nextSlide() {
        if (gallery.length <= 1) return;
        setSlideIndex((prev) => (prev + 1) % gallery.length);
    }

    function prevSlide() {
        if (gallery.length <= 1) return;
        setSlideIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
    }


    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 10 }}>Carregando anúncio...</Text>
            </View>
        );
    }

    return (
        <LinearGradient colors={[TutorPalette.background, TutorPalette.backgroundSecondary]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.page}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.navButton}>
                    <Feather name="arrow-left" size={22} color="#fff" />
                </Pressable>

                <Text style={styles.brandTitle}>{titulo}</Text>

                <Pressable onPress={() => router.push("/perfil")} style={styles.avatarButton}>
                    <Ionicons name="person" size={20} color="#fff" />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {!!error && <Text style={styles.errorText}>{error}</Text>}

                <View style={styles.galleryShell}>
                    {gallery.length > 0 ? (
                        <Image
                            source={{ uri: gallery[slideIndex] }}
                            style={{ width: imageW, height: imageH }}
                            resizeMode="cover"
                            onLoad={({ nativeEvent }) => {
                                const { width: w, height: h } = nativeEvent.source;
                                if (w && h) setImageH(Math.max(220, imageW * (h / w)));
                            }}
                        />
                    ) : (
                        <View style={styles.galleryFallback}>
                            <Ionicons name="paw" size={48} color="rgba(255,255,255,0.55)" />
                            <Text style={styles.galleryFallbackText}>Sem foto</Text>
                        </View>
                    )}

                    <View style={styles.galleryBadge}>
                        <Text style={styles.galleryBadgeText}>{gallery.length === 0 ? "0/0" : `${slideIndex + 1}/${gallery.length}`}</Text>
                    </View>

                    <Pressable onPress={prevSlide} style={[styles.galleryArrow, styles.leftArrow, gallery.length <= 1 && styles.arrowDisabled]}>
                        <Ionicons name="chevron-back" size={22} color="#fff" />
                    </Pressable>

                    <Pressable onPress={nextSlide} style={[styles.galleryArrow, styles.rightArrow, gallery.length <= 1 && styles.arrowDisabled]}>
                        <Ionicons name="chevron-forward" size={22} color="#fff" />
                    </Pressable>

                    <View style={styles.dotRow}>
                        {(gallery.length === 0 ? [0] : gallery).map((_, idx) => (
                            <View key={String(idx)} style={[styles.dot, idx === slideIndex && styles.dotActive]} />
                        ))}
                    </View>
                </View>

                <View style={styles.detailsCard}>
                    <View style={styles.petHeaderRow}>
                        <View style={{ flex: 1 }}>
                            <View style={styles.nameRow}>
                                <Ionicons name="heart" size={18} color="#fff" />
                                <Text style={styles.petName}>{data?.nomePet || "Pet"}</Text>
                            </View>
                            <Text style={styles.petType}>{String(data?.tipoPet ?? "").toUpperCase() === "GATO" ? "Gato" : "Cachorro"}</Text>
                        </View>

                        <View style={styles.sexBadge}>
                            <Ionicons name="male-female" size={16} color={TutorPalette.primary} />
                            <Text style={styles.sexBadgeText}>{formatSexo(data?.sexoPet)}</Text>
                        </View>
                    </View>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoChip}>
                            <MaterialCommunityIcons name={Number(data?.tipoPet) === 1 || String(data?.tipoPet ?? "").toUpperCase() === "GATO" ? "cat" : "dog"} size={18} color={TutorPalette.primary} />
                            <Text style={styles.infoLabel}>Raça</Text>
                            <Text style={styles.infoValue}>{data?.racaPet || "R.N.D"}</Text>
                        </View>

                        <View style={styles.infoChip}>
                            <Ionicons name="calendar" size={18} color={TutorPalette.primary} />
                            <Text style={styles.infoLabel}>Idade</Text>
                            <Text style={styles.infoValue}>{String(data?.idadePet ?? "").trim() ? String(data!.idadePet) : "Não informado"}</Text>
                        </View>

                        <View style={styles.infoChip}>
                            <Ionicons name="location" size={18} color={TutorPalette.primary} />
                            <Text style={styles.infoLabel}>Localização</Text>
                            <Text numberOfLines={2} style={styles.infoValue}>{endereco || "Não informado"}</Text>
                        </View>

                        <View style={styles.infoChip}>
                            <Ionicons name="id-card-outline" size={18} color={TutorPalette.primary} />
                            <Text style={styles.infoLabel}>Cadastro</Text>
                            <Text numberOfLines={2} style={styles.infoValue}>{data?.dataCriacao ? new Date(data.dataCriacao).toLocaleDateString("pt-BR") : "Sem data"}</Text>
                        </View>
                    </View>

                    <View style={styles.sectionBlock}>
                        <Text style={styles.sectionTitle}>Sobre {data?.nomePet || "o pet"}</Text>
                        <Text style={styles.sectionText}>{data?.descricao?.trim() ? data.descricao : "Sem descrição."}</Text>
                    </View>

                    {(base?.tipoAnuncio === 2 || (base?.tipoAnuncio === 3 && mostrarPreco)) && (
                        <View style={styles.sectionBlock}>
                            <Text style={styles.sectionTitle}>Informações adicionais</Text>
                            {base?.tipoAnuncio === 2 && !!data?.ultimoLocalVisto && <Text style={styles.sectionText}>Último local visto: {data.ultimoLocalVisto}</Text>}
                            {base?.tipoAnuncio === 2 && !!data?.dataDesaparecimento && <Text style={styles.sectionText}>Data de desaparecimento: {new Date(String(data.dataDesaparecimento)).toLocaleDateString("pt-BR")}</Text>}
                            {base?.tipoAnuncio === 3 && mostrarPreco && <Text style={styles.sectionText}>Valor: R$ {data?.valor}</Text>}
                        </View>
                    )}

                    <View style={styles.sectionBlock}>
                        <Text style={styles.sectionTitle}>Responsável</Text>
                        <Text style={styles.responsavelName}>{data?.nomeUsuario || "Não informado"}</Text>
                        <View style={styles.phoneRow}>
                            <Ionicons name="call" size={18} color={TutorPalette.primary} />
                            <Text style={styles.phoneText}>{data?.telefoneUsuario || "Telefone não disponível"}</Text>
                        </View>
                    </View>

                    <View style={styles.actions}>
                        <Pressable
                            disabled={!podeContato}
                            onPress={() => {
                                Alert.alert("Contato", data?.telefoneUsuario ? `Telefone: ${data.telefoneUsuario}` : "Telefone não disponível.");
                            }}
                            style={[styles.primaryAction, !podeContato && styles.primaryActionDisabled]}
                        >
                            <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                            <Text style={styles.primaryActionText}>Contato do Tutor</Text>
                        </Pressable>

                        {isOwner && (
                            <>
                                <Pressable
                                    onPress={() => router.push({ pathname: "/anuncios/editar", params: { id: String(id) } })}
                                    style={styles.secondaryAction}
                                >
                                    <Feather name="edit-2" size={18} color="#fff" />
                                    <Text style={styles.secondaryActionText}>Editar anúncio</Text>
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
                                    style={styles.dangerAction}
                                >
                                    <Ionicons name="trash-outline" size={18} color="#fff" />
                                    <Text style={styles.secondaryActionText}>Excluir anúncio</Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1 },
    header: {
        paddingTop: 14,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    navButton: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.10)",
    },
    avatarButton: {
        width: 56,
        height: 56,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(255,255,255,0.12)",
    },
    brandTitle: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "900",
    },
    content: {
        paddingHorizontal: 16,
        paddingBottom: 26,
    },
    errorText: {
        marginTop: 10,
        color: "#ffb4b4",
        fontWeight: "900",
    },
    galleryShell: {
        marginTop: 16,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: "#0b1730",
        position: "relative",
    },
    galleryFallback: {
        height: 260,
        alignItems: "center",
        justifyContent: "center",
    },
    galleryFallbackText: {
        marginTop: 8,
        color: "rgba(255,255,255,0.7)",
        fontWeight: "800",
    },
    galleryBadge: {
        position: "absolute",
        top: 12,
        right: 12,
        backgroundColor: "rgba(20,24,35,0.75)",
        borderRadius: 999,
        paddingVertical: 7,
        paddingHorizontal: 12,
    },
    galleryBadgeText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 18,
    },
    galleryArrow: {
        position: "absolute",
        top: "45%",
        width: 46,
        height: 46,
        borderRadius: 999,
        backgroundColor: "rgba(20,24,35,0.55)",
        alignItems: "center",
        justifyContent: "center",
    },
    leftArrow: { left: 12 },
    rightArrow: { right: 12 },
    arrowDisabled: { opacity: 0.5 },
    dotRow: {
        position: "absolute",
        bottom: 14,
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 999,
        backgroundColor: "rgba(255,255,255,0.55)",
    },
    dotActive: {
        width: 24,
        backgroundColor: TutorPalette.primary,
    },
    detailsCard: {
        marginTop: 14,
        borderRadius: 28,
        backgroundColor: "rgba(15,29,58,0.92)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        padding: 16,
        shadowColor: TutorPalette.shadow,
        shadowOpacity: 0.24,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 12 },
        elevation: 8,
    },
    petHeaderRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    nameRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    petName: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 22,
    },
    petType: {
        marginTop: 2,
        color: TutorPalette.primary,
        fontWeight: "800",
        fontSize: 20,
    },
    sexBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(47,124,246,0.20)",
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    sexBadgeText: {
        color: TutorPalette.primary,
        fontWeight: "900",
    },
    infoGrid: {
        marginTop: 14,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
    },
    infoChip: {
        width: "48%",
        minHeight: 92,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.10)",
        backgroundColor: "rgba(9,19,40,0.55)",
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    infoLabel: {
        marginTop: 6,
        color: "#8ea5cb",
        fontWeight: "700",
        fontSize: 13,
    },
    infoValue: {
        marginTop: 2,
        color: "#fff",
        fontWeight: "800",
        fontSize: 15,
    },
    sectionBlock: {
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.08)",
    },
    sectionTitle: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 18,
    },
    sectionText: {
        marginTop: 8,
        color: "#e3ebff",
        fontWeight: "700",
        lineHeight: 22,
    },
    responsavelName: {
        marginTop: 8,
        color: "#fff",
        fontSize: 18,
        fontWeight: "800",
    },
    phoneRow: {
        marginTop: 8,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    phoneText: {
        color: "#fff",
        fontWeight: "800",
        fontSize: 16,
    },
    actions: {
        marginTop: 16,
        gap: 10,
    },
    primaryAction: {
        backgroundColor: TutorPalette.primary,
        borderRadius: 999,
        paddingVertical: 16,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    primaryActionDisabled: {
        backgroundColor: "rgba(47,124,246,0.35)",
    },
    primaryActionText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 18,
    },
    secondaryAction: {
        backgroundColor: "rgba(30,35,47,0.85)",
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.16)",
    },
    dangerAction: {
        backgroundColor: "rgba(210,64,78,0.95)",
        borderRadius: 999,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
    },
    secondaryActionText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 16,
    },
});
