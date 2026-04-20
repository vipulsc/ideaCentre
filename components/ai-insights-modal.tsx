"use client";

import { Gauge, Map, Sparkles, Swords, Users, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { IdeaInsights } from "@/lib/ai/insights";

export type { IdeaInsights, RoadmapPhase } from "@/lib/ai/insights";

type Props = {
  ideaId: string | null;
  title?: string;
  onClose: () => void;
};

export function AiInsightsModal({ ideaId, title, onClose }: Props) {
  const [insights, setInsights] = useState<IdeaInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!ideaId) {
      setInsights(null);
      setError(null);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setInsights(null);

    (async () => {
      try {
        const res = await fetch(`/api/ideas/${ideaId}/insights`);
        const payload = (await res.json()) as {
          ok: boolean;
          insights?: IdeaInsights;
          message?: string;
        };
        if (cancelled) return;
        if (!res.ok || !payload.ok || !payload.insights) {
          setError(payload.message ?? "Couldn't generate insights");
          return;
        }
        setInsights(payload.insights);
      } catch {
        if (!cancelled) setError("Couldn't generate insights");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [ideaId]);

  useEffect(() => {
    if (!ideaId) return;
    const frame = requestAnimationFrame(() => setIsOpen(true));
    return () => cancelAnimationFrame(frame);
  }, [ideaId]);

  const closeWithAnimation = useCallback(() => {
    if (closeTimerRef.current) return;
    setIsOpen(false);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 220);
  }, [onClose]);

  useEffect(() => {
    if (!ideaId) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") closeWithAnimation();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeWithAnimation, ideaId]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  if (!ideaId) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-0 backdrop-blur-sm transition-opacity duration-300 sm:items-center sm:px-4 ${
        isOpen ? "opacity-100" : "opacity-0"
      }`}
      onClick={closeWithAnimation}
    >
      <div
        className={`relative flex max-h-[92vh] w-full max-w-full flex-col overflow-hidden rounded-t-2xl border border-white/12 border-b-0 bg-[#0B0B0B] shadow-2xl transition-transform duration-300 ease-out sm:max-h-[90vh] sm:max-w-3xl sm:rounded-2xl sm:border-b lg:max-w-4xl ${
          isOpen ? "translate-y-0" : "translate-y-full sm:translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b border-white/10 px-6 py-5 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/6 px-3 py-1">
                <Sparkles className="size-3.5 text-[#7DFF00]" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65">
                  AI Insights
                </p>
              </div>
              {title && (
                <h3 className="mt-3 line-clamp-2 text-base font-semibold leading-snug text-white/95 sm:text-lg">
                  {title}
                </h3>
              )}
            </div>
          <button
            type="button"
            onClick={closeWithAnimation}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/6 text-white/60 transition-colors hover:bg-white/12 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
          </div>
        </header>

        <div className="hide-scrollbar flex-1 overflow-y-auto px-6 py-6 sm:px-7">
          {loading && <InsightsSkeleton />}
          {error && !loading && (
            <p className="py-8 text-center text-sm text-white/50">{error}</p>
          )}
          {insights && !loading && <InsightsContent insights={insights} />}
        </div>
      </div>
    </div>
  );
}

function InsightsContent({ insights }: { insights: IdeaInsights }) {
  return (
    <div className="flex flex-col gap-5 sm:gap-6">
      {insights.summary && (
        <section className="rounded-xl border border-white/10 bg-white/3 px-4 py-3.5 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/45">
            Summary
          </p>
          <p className="mt-2 text-sm leading-7 text-white/82">{insights.summary}</p>
        </section>
      )}

      {insights.recommendedStack && (
        <div className="rounded-xl border border-white/10 bg-white/3 px-4 py-3.5 sm:px-5">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/45">
            Suggested stack
          </p>
          <p className="mt-2 text-sm leading-7 text-white/85">
            {insights.recommendedStack}
          </p>
        </div>
      )}

      <section className="rounded-xl border border-white/10 bg-white/2 p-4 sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <Gauge className="size-3.5 text-white/70" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
            Acceptance Score
          </span>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-6xl font-bold leading-none tracking-tight text-white tabular-nums">
            {insights.acceptanceScore}
          </span>
          <span className="mb-1.5 text-sm font-medium text-white/40">
            / 100
          </span>
        </div>
        {insights.scoreTags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {insights.scoreTags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/12 bg-white/3 px-3 py-1 text-xs font-medium text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </section>

      {insights.roadmap.length > 0 && (
        <section className="rounded-xl border border-white/10 bg-white/2 p-4 sm:p-5">
          <div className="mb-5 flex items-center gap-2">
            <Map className="size-3.5 text-white/70" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
              Build Roadmap
            </span>
          </div>
          <ol className="flex flex-col gap-6">
            {insights.roadmap.map((step, i) => (
              <li key={`${step.phase}-${i}`} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs font-semibold text-white/80">
                  {i + 1}
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2.5">
                  <div>
                    <span className="text-sm font-semibold text-white/95">
                      {step.phase}
                    </span>
                    {step.summary && (
                      <p className="mt-1 text-sm leading-7 text-white/70">
                        {step.summary}
                      </p>
                    )}
                  </div>
                  {step.steps && step.steps.length > 0 ? (
                    <ul className="flex flex-col gap-2 border-l border-white/12 pl-3.5">
                      {step.steps.map((line, j) => (
                        <li
                          key={`${step.phase}-${j}`}
                          className="text-[13px] leading-6 text-white/82 text-pretty"
                        >
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : step.detail ? (
                    <p className="text-[13px] leading-6 text-white/82 text-pretty">
                      {step.detail}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      {insights.competitors.length > 0 && (
        <section className="rounded-xl border border-white/10 bg-white/2 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Swords className="size-3.5 text-white/70" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
              Competitor Radar
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {insights.competitors.map((c) => (
              <li
                key={c.name}
                className="flex flex-col gap-1.5 rounded-lg border border-white/10 bg-white/3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <span className="text-sm font-semibold text-white/92">
                  {c.name}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md border border-white/12 bg-white/2 px-2 py-0.5 text-[11px] font-medium text-white/82">
                    {c.strength}
                  </span>
                  <span className="rounded-md border border-white/12 bg-white/2 px-2 py-0.5 text-[11px] font-medium text-white/60">
                    {c.gap}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {insights.audience.length > 0 && (
        <section className="rounded-xl border border-white/10 bg-white/2 p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Users className="size-3.5 text-white/70" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
              Target Audience
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {insights.audience.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/12 bg-white/3 px-3 py-1 text-xs font-medium text-white/82"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-4 w-3/4 animate-pulse rounded bg-white/5" />
      <div className="rounded-xl border border-white/10 p-5">
        <div className="mb-4 h-3 w-32 animate-pulse rounded bg-white/5" />
        <div className="h-14 w-24 animate-pulse rounded bg-white/5" />
      </div>
      <div className="rounded-xl border border-white/10 p-5">
        <div className="mb-5 h-3 w-28 animate-pulse rounded bg-white/5" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-7 w-7 animate-pulse rounded-full bg-white/5" />
              <div className="h-3 w-16 animate-pulse rounded bg-white/5" />
              <div className="h-3 w-20 animate-pulse rounded bg-white/5" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-xl border border-white/10 p-5">
        <div className="mb-4 h-3 w-32 animate-pulse rounded bg-white/5" />
        <div className="flex flex-col gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    </div>
  );
}
