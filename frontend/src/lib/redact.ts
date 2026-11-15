/** Kunci yang tidak boleh ikut tercatat di log walau suatu saat muncul di pesan error. */
const SECRET_PATTERN = /(bearer\s+)[\w.~+/-]+|((?:token|password|kata_?sandi|session|cookie)["']?\s*[:=]\s*["']?)[^\s"'&,;]+/gi;

export function redactSecrets(text: string) {
  return text.replace(SECRET_PATTERN, (_match, bearer: string | undefined, key: string | undefined) => `${bearer ?? key}[DISENSOR]`);
}
