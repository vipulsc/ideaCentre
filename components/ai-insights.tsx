"use client";

import {
  Brain,
  Map,
  Swords,
  Gauge,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { Reveal } from "@/components/reveal";

const roadmapSteps = [
  { phase: "Validate", detail: "User surveys & landing page test" },
  { phase: "MVP", detail: "Core product with summarisation API" },
  { phase: "Launch", detail: "Product Hunt & distribution channels" },
  { phase: "Grow", detail: "Monetisation, integrations & scale" },
];

const competitors = [
  { name: "Summarize.tech", strength: "YouTube focus", gap: "No browser-wide support" },
  { name: "Eightify", strength: "Polished UX", gap: "Paid-only, no free tier" },
  { name: "TLDR This", strength: "Article summaries", gap: "No video support" },
];

const audienceTags = [
  "Developers", "Students", "Researchers", "Content creators",
  "Remote workers", "Indie hackers", "Product managers",
];

export function AiInsights() {
  return (
    <section
      className="px-4 py-8 sm:px-6 sm:py-10 md:py-12 lg:py-16"
      aria-labelledby="ai-insights-heading"
    >
      <div className="mx-auto w-full max-w-screen-2xl 2xl:max-w-400">
        {/* Header */}
        <div className="mb-10 flex max-w-2xl flex-col gap-3 sm:mb-14">
          <Reveal direction="up">
            <div className="flex items-center gap-2">
              <Brain className="size-4 text-palette-primary" />
              <p className="text-sm font-semibold uppercase tracking-widest text-palette-primary">
                AI-Powered Insights
              </p>
            </div>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <h2
              id="ai-insights-heading"
              className="font-display-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl"
            >
              Every idea comes with
              <br />
              a blueprint.
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.2}>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              The moment an idea is posted, our AI breaks it down&nbsp;&mdash;
              roadmap, competitors, audience, and a viability score. So you
              spend time building, not guessing.
            </p>
          </Reveal>
        </div>

        {/* Bento grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5">
          {/* ── Card 1 · Acceptance Score ── */}
          <Reveal direction="up" delay={0.1}>
            <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-palette-primary p-7 text-primary-foreground sm:p-8 xl:rounded-3xl">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-6 -top-6 font-display-serif text-[11rem] leading-none text-primary-foreground/6 transition-all duration-500 group-hover:text-primary-foreground/10"
              >
                82
              </div>

              <div className="relative z-10">
                <div className="mb-5 flex items-center gap-2">
                  <Gauge className="size-4 text-primary-foreground/70" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">
                    Acceptance Score
                  </span>
                </div>

                <div className="flex items-end gap-3">
                  <span className="font-display-serif text-7xl leading-none tracking-tight sm:text-8xl">
                    82
                  </span>
                  <span className="mb-2 text-sm font-medium text-primary-foreground/60">
                    / 100
                  </span>
                </div>
              </div>

              <div className="relative z-10 mt-8 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
                  <TrendingUp className="size-3" />
                  High demand
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
                  <AlertCircle className="size-3" />
                  Moderate competition
                </span>
              </div>
            </div>
          </Reveal>

          {/* ── Card 2 · Build Roadmap ── */}
          <Reveal direction="up" delay={0.2} className="sm:col-span-1 lg:col-span-2">
            <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-7 sm:p-8 xl:rounded-3xl">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-3 -top-4 font-display-serif text-[9rem] leading-none text-palette-primary/4 transition-all duration-500 group-hover:text-palette-primary/8"
              >
                04
              </span>

              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-2">
                  <Map className="size-4 text-palette-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-palette-primary">
                    Build Roadmap
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 sm:gap-y-0">
                  {roadmapSteps.map((step, i) => (
                    <div key={step.phase} className="relative flex flex-col gap-2">
                      {/* Connector line (hidden on last) */}
                      {i < roadmapSteps.length - 1 && (
                        <div
                          aria-hidden
                          className="absolute left-3.5 top-[18px] hidden h-px w-[calc(100%+1.5rem)] bg-palette-primary/15 sm:block"
                        />
                      )}
                      <div className="flex items-center gap-2.5">
                        <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-palette-primary/25 bg-card text-xs font-bold text-palette-primary">
                          {i + 1}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {step.phase}
                        </span>
                      </div>
                      <p className="pl-[38px] text-xs leading-relaxed text-muted-foreground sm:pl-0 sm:pt-1">
                        {step.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── Card 3 · Competitor Radar ── */}
          <Reveal direction="up" delay={0.3} className="sm:col-span-1 lg:col-span-2">
            <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-7 sm:p-8 xl:rounded-3xl">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-2 -top-4 font-display-serif text-[9rem] leading-none text-palette-primary/4 transition-all duration-500 group-hover:text-palette-primary/8"
              >
                vs
              </span>

              <div className="relative z-10">
                <div className="mb-5 flex items-center gap-2">
                  <Swords className="size-4 text-palette-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-palette-primary">
                    Competitor Radar
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {competitors.map((c) => (
                    <div
                      key={c.name}
                      className="flex flex-col gap-1 rounded-xl bg-background px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                    >
                      <span className="text-sm font-semibold text-foreground">
                        {c.name}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-palette-primary/8 px-2 py-0.5 text-xs font-medium text-palette-primary">
                          {c.strength}
                        </span>
                        <span className="rounded-md bg-destructive/8 px-2 py-0.5 text-xs font-medium text-destructive">
                          {c.gap}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>

          {/* ── Card 4 · Target Audience ── */}
          <Reveal direction="up" delay={0.4}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-palette-primary p-7 text-primary-foreground sm:p-8 xl:rounded-3xl">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-4 -bottom-6 font-display-serif text-[10rem] leading-none text-primary-foreground/6 transition-all duration-500 group-hover:text-primary-foreground/10"
              >
                &amp;
              </span>

              <div className="relative z-10 mb-5 flex items-center gap-2">
                <Users className="size-4 text-primary-foreground/70" />
                <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground/60">
                  Target Audience
                </span>
              </div>

              <p className="relative z-10 mb-5 text-sm leading-relaxed text-primary-foreground/80">
                Know exactly who your first users are and where to find them.
              </p>

              <div className="relative z-10 mt-auto flex flex-wrap gap-2">
                {audienceTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium text-primary-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
