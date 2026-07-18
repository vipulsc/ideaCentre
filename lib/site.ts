/**
 * Central site configuration used across metadata, sitemap, robots,
 * structured data and Open Graph. Set NEXT_PUBLIC_SITE_URL in production to
 * your canonical origin (e.g. https://www.ideacentre.xyz).
 */
const rawUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://www.ideacentre.xyz";

export const siteConfig = {
  name: "ideaCentre",
  url: rawUrl.replace(/\/+$/, ""),
  title: "ideaCentre — Your next idea is one swipe away",
  description:
    "Discover startup ideas in seconds. Swipe a reel-style feed of startup ideas, save the ones that spark something, upvote the best, and let AI turn any idea into a build-ready plan.",
  tagline: "Discover. Share. Build.",
  ogImageAlt: "ideaCentre — Your next idea is one swipe away",
  locale: "en_US",
  email: "hello@ideacentre.xyz",
  keywords: [
    "startup ideas",
    "startup idea generator",
    "business ideas",
    "SaaS ideas",
    "side project ideas",
    "app ideas",
    "idea discovery",
    "startup inspiration",
    "AI startup ideas",
    "indie hacker ideas",
    "product ideas",
    "validate startup ideas",
  ],
} as const;

/** Build an absolute URL for a given path against the canonical origin. */
export function absoluteUrl(path = "/"): string {
  return new URL(path, siteConfig.url).toString();
}
