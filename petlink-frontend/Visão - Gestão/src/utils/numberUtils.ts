export function parseDecimalInput(value: string): number {
  const normalized = value.trim().replace(/\s+/g, "");
  if (!normalized) return Number.NaN;

  const hasComma = normalized.includes(",");
  const hasDot = normalized.includes(".");

  if (hasComma && hasDot) {
    const lastComma = normalized.lastIndexOf(",");
    const lastDot = normalized.lastIndexOf(".");
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandSeparator = decimalSeparator === "," ? /\./g : /,/g;

    const merged = normalized.replace(thousandSeparator, "").replace(decimalSeparator, ".");
    return Number(merged);
  }

  if (hasComma) {
    return Number(normalized.replace(/\./g, "").replace(",", "."));
  }

  return Number(normalized);
}

export function parseIntInput(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return Number.NaN;
  return Math.trunc(parsed);
}
