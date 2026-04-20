import { generateGeminiJson } from "@/lib/ai/gemini";

export type RoadmapPhase = {
  phase: string;
  /** One short sentence: what this phase is for */
  summary?: string;
  /** Human-readable steps (preferred) */
  steps?: string[];
  /** Legacy single block from older generations */
  detail?: string;
};

export type IdeaInsights = {
  acceptanceScore: number;
  scoreTags: string[];
  /** One line: best-fit stack for this idea (any ecosystem — web, mobile, native, etc.) */
  recommendedStack?: string;
  roadmap: RoadmapPhase[];
  competitors: { name: string; strength: string; gap: string }[];
  audience: string[];
  summary: string;
};

function buildPrompt(params: {
  title: string;
  idea: string;
  description?: string | null;
  category: string;
}) {
  return [
    "You are a senior full-stack engineer and product strategist.",
    "Analyze the idea and respond ONLY with JSON matching the given schema.",
    "",
    `Title: ${params.title}`,
    `Category: ${params.category}`,
    `Idea: ${params.idea}`,
    params.description ? `Description: ${params.description}` : "",
    "",
    "Stack (VERY IMPORTANT):",
    "- Pick the BEST fit for THIS idea — not always a web app. Examples: Next.js + Supabase for B2B web; Flutter or React Native for mobile-first; FastAPI + Postgres for heavy ML APIs; Electron/Tauri for desktop; Unity/Godot for games; Shopify for commerce; WordPress for content sites.",
    "- In `recommendedStack`, write ONE clear sentence naming the stack and why (plain English, no buzzwords).",
    "",
    "Roadmap (VERY IMPORTANT):",
    "- Phases must be exactly: Validate, MVP, Launch, Grow (in that order).",
    "- For EACH phase provide `summary` (one short sentence, human-readable) AND `steps` (array of 3-5 strings).",
    "- Each step is a full sentence or short phrase that sounds natural when read aloud — not a comma-separated blob.",
    "- Steps must name concrete work: features, data models, auth, APIs, tests, deploy, analytics, payments, etc., appropriate to the chosen stack.",
    "- Do NOT default to Next.js unless it is actually the best choice.",
    "",
    "Phase hints (adapt stack and wording to the idea):",
    "- Validate: problem interviews, landing/waitlist, analytics, pricing signal.",
    "- MVP: core product slice, schema, auth, main screens, one happy path.",
    "- Launch: automated tests, monitoring, security/rate limits, deploy, distribution.",
    "- Grow: monetization, retention, SEO/community/integrations, scale.",
    "",
    "Return JSON with this exact shape:",
    `{
  "acceptanceScore": number,
  "scoreTags": string[],
  "recommendedStack": "One sentence.",
  "roadmap": [
    { "phase": "Validate", "summary": "One sentence.", "steps": ["...", "..."] },
    { "phase": "MVP", "summary": "...", "steps": ["...", "..."] },
    { "phase": "Launch", "summary": "...", "steps": ["...", "..."] },
    { "phase": "Grow", "summary": "...", "steps": ["...", "..."] }
  ],
  "competitors": [ { "name": "...", "strength": "...", "gap": "..." } ],
  "audience": string[],
  "summary": "1-2 sentences overview of the opportunity."
}`,
    "Rules: each step under 120 characters when possible. competitors: strength and gap under 12 words. No markdown. No preamble.",
  ]
    .filter(Boolean)
    .join("\n");
}

function legacyDetailToSteps(detail: string): string[] {
  const t = detail.trim();
  if (!t) return [];
  const bySemi = t.split(/;\s+/).map((s) => s.trim()).filter(Boolean);
  if (bySemi.length >= 2) return bySemi.slice(0, 6);
  return [t];
}

function sanitizeRoadmapItem(r: RoadmapPhase): RoadmapPhase {
  const phase = String(r.phase ?? "").slice(0, 24);
  const summary = r.summary?.trim()
    ? String(r.summary).slice(0, 220)
    : undefined;
  let steps = (r.steps ?? [])
    .map((s) => String(s).trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((s) => s.slice(0, 200));
  if (steps.length === 0 && r.detail?.trim()) {
    steps = legacyDetailToSteps(String(r.detail));
  }
  return { phase, summary, steps: steps.length ? steps : undefined, detail: r.detail };
}

function sanitize(insights: IdeaInsights): IdeaInsights {
  const score = Number.isFinite(insights.acceptanceScore)
    ? Math.max(0, Math.min(100, Math.round(insights.acceptanceScore)))
    : 0;
  return {
    acceptanceScore: score,
    scoreTags: (insights.scoreTags ?? []).slice(0, 3),
    recommendedStack: insights.recommendedStack?.trim()
      ? String(insights.recommendedStack).slice(0, 280)
      : undefined,
    roadmap: (insights.roadmap ?? []).slice(0, 4).map(sanitizeRoadmapItem),
    competitors: (insights.competitors ?? []).slice(0, 3).map((c) => ({
      name: String(c.name ?? "").slice(0, 40),
      strength: String(c.strength ?? "").slice(0, 40),
      gap: String(c.gap ?? "").slice(0, 40),
    })),
    audience: (insights.audience ?? [])
      .slice(0, 7)
      .map((t) => String(t).slice(0, 32)),
    summary: String(insights.summary ?? "").slice(0, 280),
  };
}

export async function generateIdeaInsights(params: {
  title: string;
  idea: string;
  description?: string | null;
  category: string;
}): Promise<IdeaInsights> {
  const raw = await generateGeminiJson<IdeaInsights>(buildPrompt(params));
  return sanitize(raw);
}
