export function getApiErrorMessage(payload: any, fallback: string) {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  if (payload?.message) return payload.message;
  if (payload?.title) return payload.title;

  const validationErrors = payload?.errors;
  if (validationErrors && typeof validationErrors === "object") {
    const entries = Object.entries(validationErrors) as Array<[string, string[]]>;
    const messages = entries
      .flatMap(([, value]) => (Array.isArray(value) ? value : []))
      .filter(Boolean);

    if (messages.length > 0) return messages.join("\n");
  }

  if (payload?.data?.errorMessage) return payload.data.errorMessage;
  if (payload?.data?.ErrorMessage) return payload.data.ErrorMessage;
  return fallback;
}
