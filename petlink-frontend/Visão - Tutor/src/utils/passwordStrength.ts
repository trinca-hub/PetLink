export type PasswordStrength = "fraca" | "media" | "forte";

export function getPasswordStrength(password: string): PasswordStrength {
  const categories = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((rule) => rule.test(password)).length;
  if (password.length >= 12 && categories === 4) return "forte";
  if (password.length >= 8 && categories >= 3) return "media";
  return "fraca";
}

export function isPasswordAccepted(password: string) {
  return getPasswordStrength(password) !== "fraca";
}
