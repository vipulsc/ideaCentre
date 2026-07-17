export const ALLOWED_CATEGORIES = [
  "AI / Health",
  "Community",
  "SaaS",
  "Education",
  "Finance",
  "Sustainability",
  "Entertainment",
  "Other",
] as const;

export type AllowedCategory = (typeof ALLOWED_CATEGORIES)[number];

export const IDEA_LIMITS = {
  titleMaxChars: 120,
  titleMaxWords: 10,
  ideaMaxChars: 800,
  ideaMaxWords: 60,
  descriptionMaxChars: 5000,
  commentMaxChars: 500,
} as const;

export const FEED_PAGE_SIZE = 30;
export const FEED_MAX_PAGE_SIZE = 50;

export function isAllowedCategory(value: string): value is AllowedCategory {
  return (ALLOWED_CATEGORIES as readonly string[]).includes(value);
}

export function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export function clampWords(text: string, max: number) {
  const trimmed = text.trim();
  if (!trimmed) return "";
  const words = trimmed.split(/\s+/);
  if (words.length <= max) return trimmed;
  return words.slice(0, max).join(" ");
}

export const DEFAULT_IDEA_COLOR = "#0a1a12";

export const ALLOWED_MUSIC_TRACKS = [
  "/music/music1.mp3",
  "/music/music2.mp3",
  "/music/music3.mp3",
  "/music/music4.mp3",
  "/music/music5.mp3",
  "/music/music6.mp3",
  "/music/music7.mp3",
  "/music/music8.mp3",
] as const;

const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

/** Returns a safe hex color, falling back to the default when invalid. */
export function normalizeColor(input: unknown): string {
  if (typeof input !== "string") return DEFAULT_IDEA_COLOR;
  const trimmed = input.trim();
  return HEX_COLOR_RE.test(trimmed) ? trimmed : DEFAULT_IDEA_COLOR;
}

/** Returns an allowlisted music track path, or null for anything else. */
export function normalizeMusic(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  return (ALLOWED_MUSIC_TRACKS as readonly string[]).includes(trimmed)
    ? trimmed
    : null;
}

export function normalizeIdeaFields(input: {
  title?: string;
  idea?: string;
  description?: string | null;
  category?: string;
}) {
  const title = clampWords(
    (input.title ?? "").trim().slice(0, IDEA_LIMITS.titleMaxChars),
    IDEA_LIMITS.titleMaxWords,
  );
  const idea = clampWords(
    (input.idea ?? "").trim().slice(0, IDEA_LIMITS.ideaMaxChars),
    IDEA_LIMITS.ideaMaxWords,
  );
  const descriptionRaw = (input.description ?? "").trim();
  const description = descriptionRaw
    ? descriptionRaw.slice(0, IDEA_LIMITS.descriptionMaxChars)
    : null;
  const categoryRaw = (input.category ?? "Other").trim();
  const category = isAllowedCategory(categoryRaw) ? categoryRaw : "Other";

  return { title, idea, description, category };
}
