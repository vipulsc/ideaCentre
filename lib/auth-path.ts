/** Same-origin relative path only (safe for redirects / OAuth callbackUrl). */
export function safeInternalPath(value: string | null | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return null;
  }
  if (value.includes("\\") || value.includes("://")) {
    return null;
  }

  try {
    const parsed = new URL(value, "http://n");
    if (parsed.username || parsed.password) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}
