export type ShareResult =
  | { ok: true; mode: "native" | "clipboard" }
  | { ok: false; mode: "cancelled" | "unsupported" | "error" };

export type ShareIdeaInput = {
  id: string;
  title: string;
  idea?: string | null;
  authorName?: string | null;
};

export async function shareIdea(input: ShareIdeaInput): Promise<ShareResult> {
  if (typeof window === "undefined") return { ok: false, mode: "unsupported" };

  const url = `${window.location.origin}/reel?idea=${encodeURIComponent(input.id)}`;
  const trimmedIdea = input.idea?.trim();
  const byAuthor = input.authorName?.trim()
    ? ` — by ${input.authorName.trim()}`
    : "";
  const text = trimmedIdea
    ? `${input.title}${byAuthor}\n\n${trimmedIdea}`
    : `${input.title}${byAuthor}`;

  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function"
  ) {
    try {
      await navigator.share({ title: input.title, text, url });
      return { ok: true, mode: "native" };
    } catch (err) {
      if ((err as { name?: string })?.name === "AbortError") {
        return { ok: false, mode: "cancelled" };
      }
      // Fall through to clipboard fallback on other errors.
    }
  }

  try {
    if (
      typeof navigator !== "undefined" &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === "function"
    ) {
      await navigator.clipboard.writeText(url);
      return { ok: true, mode: "clipboard" };
    }
  } catch {
    // Ignored — fall through to error.
  }

  return { ok: false, mode: "error" };
}
