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
