export function isPasswordAccepted(password: string) {
  const groups = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((rule) => rule.test(password)).length;
  return password.length >= 8 && groups >= 3;
}

export function passwordStrength(password: string) {
  const groups = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((rule) => rule.test(password)).length;
  return password.length >= 12 && groups === 4 ? "forte" : isPasswordAccepted(password) ? "média" : "fraca";
}
