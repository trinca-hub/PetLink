import { Image } from "react-native";

export type ImageValidationResult = {
  valid: boolean;
  message?: string;
};

export function isLikelyHttpUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function validateImageUrl(url: string): Promise<ImageValidationResult> {
  if (!isLikelyHttpUrl(url)) {
    return { valid: false, message: "A URL deve começar com http:// ou https://" };
  }

  try {
    await Image.prefetch(url.trim());
    return { valid: true };
  } catch {
    return { valid: false, message: "Não foi possível carregar a imagem no preview." };
  }
}
