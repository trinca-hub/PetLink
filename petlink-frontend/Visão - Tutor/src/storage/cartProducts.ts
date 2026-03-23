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

export async function getCartProducts(userId: number): Promise<CartProductItem[]> {
    const raw = await AsyncStorage.getItem(keyCart(userId));
    return raw ? JSON.parse(raw) : [];
}

export async function setCartProducts(userId: number, items: CartProductItem[]) {
    await AsyncStorage.setItem(keyCart(userId), JSON.stringify(items));
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

        // ✅ trava no estoque (se tiver)
        const novaQuantidade =
            typeof atualEstoque === "number" ? Math.min(soma, atualEstoque) : soma;

        next[idx] = {
            ...atual,
            ...item, // atualiza nome/foto/preço/estoque caso o produto mude
            estoque: atualEstoque,
            quantidade: novaQuantidade,
        };

        await setCartProducts(userId, next);
        return next;
    }

    // ✅ item novo
    const quantidadeInicial =
        typeof estoque === "number" ? Math.min(safeQty, estoque) : safeQty;

    const next = [...cart, { ...item, quantidade: quantidadeInicial }];
    await setCartProducts(userId, next);
    return next;
}


export async function clearCartProducts(userId: number) {
    await AsyncStorage.removeItem(keyCart(userId));
}
