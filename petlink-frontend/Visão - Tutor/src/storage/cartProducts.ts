import AsyncStorage from "@react-native-async-storage/async-storage";

export type CartProductItem = {
    produtoId: number;
    nome: string;
    preco: number;
    foto?: string;
    quantidade: number;
    estoque?: number; // opcional (pra validar antes de comprar)
};

const keyCart = (userId: number) => `cart:products:${userId}`;

function toSafeNumber(value: unknown, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function normalizeCartItem(item: CartProductItem): CartProductItem | null {
    const produtoId = toSafeNumber(item?.produtoId, 0);
    if (produtoId <= 0) return null;

    const estoque =
        typeof item?.estoque === "number" && Number.isFinite(item.estoque)
            ? Math.max(0, Math.floor(item.estoque))
            : undefined;

    const quantidadeBase = Math.max(0, Math.floor(toSafeNumber(item?.quantidade, 0)));
    const quantidade =
        typeof estoque === "number"
            ? estoque <= 0
                ? 0
                : Math.min(Math.max(1, quantidadeBase || 1), estoque)
            : Math.max(1, quantidadeBase || 1);

    return {
        ...item,
        produtoId,
        quantidade,
        estoque,
        preco: toSafeNumber(item?.preco, 0),
    };
}

function normalizeCartItems(items: CartProductItem[]) {
    return items
        .map((item) => normalizeCartItem(item))
        .filter((item): item is CartProductItem => Boolean(item));
}

export async function getCartProducts(userId: number): Promise<CartProductItem[]> {
    const raw = await AsyncStorage.getItem(keyCart(userId));
    const parsed = raw ? (JSON.parse(raw) as CartProductItem[]) : [];
    return normalizeCartItems(Array.isArray(parsed) ? parsed : []);
}

export async function setCartProducts(userId: number, items: CartProductItem[]) {
    const normalized = normalizeCartItems(items);
    await AsyncStorage.setItem(keyCart(userId), JSON.stringify(normalized));
}

export async function addToCartProducts(
    userId: number,
    item: Omit<CartProductItem, "quantidade">,
    qty = 1
) {
    const cart = await getCartProducts(userId);
    const idx = cart.findIndex((x) => x.produtoId === item.produtoId);

    const estoque = typeof item.estoque === "number" ? item.estoque : undefined;
    const safeQty = Math.max(1, Number(qty) || 1);

    if (idx >= 0) {
        const next = [...cart];

        const atual = next[idx];
        const atualEstoque =
            typeof atual.estoque === "number" ? atual.estoque : estoque;

        const soma = atual.quantidade + safeQty;

        // trava no estoque (se tiver) e respeita indisponivel
        const novaQuantidade =
            typeof atualEstoque === "number"
                ? atualEstoque <= 0
                    ? 0
                    : Math.min(soma, atualEstoque)
                : soma;

        const normalized = normalizeCartItem({
            ...atual,
            ...item,
            estoque: atualEstoque,
            quantidade: novaQuantidade,
        });

        if (!normalized) {
            return cart;
        }

        next[idx] = normalized;

        await setCartProducts(userId, next);
        return next;
    }

    // item novo
    const quantidadeInicial =
        typeof estoque === "number"
            ? estoque <= 0
                ? 0
                : Math.min(safeQty, estoque)
            : safeQty;

    const normalized = normalizeCartItem({ ...item, quantidade: quantidadeInicial });
    if (!normalized) {
        return cart;
    }

    const next = [...cart, normalized];
    await setCartProducts(userId, next);
    return next;
}

export async function removeCartProduct(userId: number, produtoId: number) {
    const cart = await getCartProducts(userId);
    const next = cart.filter((item) => item.produtoId !== produtoId);
    await setCartProducts(userId, next);
    return next;
}


export async function clearCartProducts(userId: number) {
    await AsyncStorage.removeItem(keyCart(userId));
}
