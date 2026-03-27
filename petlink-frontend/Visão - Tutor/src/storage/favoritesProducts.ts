import AsyncStorage from "@react-native-async-storage/async-storage";

const keyFav = (userId: number) => `favorites:products:${userId}`;

export async function getFavoriteProductIds(userId: number): Promise<number[]> {
  const raw = await AsyncStorage.getItem(keyFav(userId));
  return raw ? JSON.parse(raw) : [];
}

export async function toggleFavoriteProduct(userId: number, produtoId: number): Promise<number[]> {
  const list = await getFavoriteProductIds(userId);
  const next = list.includes(produtoId) ? list.filter((id) => id !== produtoId) : [...list, produtoId];
  await AsyncStorage.setItem(keyFav(userId), JSON.stringify(next));
  return next;
}

export async function isFavoriteProduct(userId: number, produtoId: number): Promise<boolean> {
  const list = await getFavoriteProductIds(userId);
  return list.includes(produtoId);
}
