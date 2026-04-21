"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const teasers = [
  {
    tag: "AI",
    hook: "Voice memos become",
    blurLine: "structured specs while you walk",
  },
  {
    tag: "SaaS",
    hook: "A marketplace for",
    blurLine: "templates nobody bundles yet",
  },
  {
    tag: "Dev tools",
    hook: "One CLI that",
    blurLine: "ships your side project in a weekend",
  },
  {
    tag: "Productivity",
    hook: "Your calendar, but it",
    blurLine: "nags you in the kindest way possible",
  },
  {
    tag: "Consumer",
    hook: "An app that only works",
    blurLine: "when you're procrastinating (seriously)",
  },
  {
    tag: "Creator",
    hook: "Turn random thoughts into",
    blurLine: "ideas ready to build instantly",
  },
] as const;

function ChromaticWord({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={cn("relative inline-block", className)}>
      <span
        className="absolute inset-0 translate-x-[2px] text-palette-secondary/55"
        aria-hidden
      >
        {children}
      </span>
      <span
        className="absolute inset-0 -translate-x-[2px] text-palette-primary/40"
        aria-hidden
      >
        {children}
      </span>
      <span className="relative">{children}</span>
    </span>
  );
}

function SprocketRail() {
  return (
    <div
      className="flex w-5 shrink-0 flex-col items-center justify-between py-6 sm:w-6 sm:py-10"
      aria-hidden
    >
      {Array.from({ length: 26 }).map((_, i) => (
        <div
          key={i}
          className="size-2 rounded-full bg-foreground/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-foreground/5 sm:size-2.5"
        />
      ))}
    </div>
  );
}

export function CuriosityPeek() {
  const strip = [...teasers, ...teasers];

  return (
    <section
      className="relative isolate overflow-hidden py-8 sm:py-10 md:py-12 lg:py-16"
      aria-labelledby="curiosity-heading"
    >
      {/* Skewed light trap — feels like a booth, not a “section” */}
      <div
        className="pointer-events-none absolute -z-20 h-[120%] w-[min(140vw,72rem)] -translate-x-1/2 -translate-y-1/2 rotate-[7deg] bg-linear-to-br from-palette-primary/14 via-palette-tertiary/20 to-transparent opacity-90"
        style={{ left: "58%", top: "42%" }}
        aria-hidden
      />

      <div
        className="pointer-events-none absolute -z-10 size-[min(88vw,36rem)] rounded-full bg-palette-secondary/10 blur-3xl"
        style={{ left: "8%", top: "20%" }}
        aria-hidden
      />

      {/* Fake stock metadata — sets the fiction */}
      <div className="mx-auto mb-10 flex w-full max-w-screen-2xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground sm:mb-12 sm:justify-between sm:px-6 2xl:max-w-800">
        <span className="tabular-nums">1,000+ ideas queued</span>
        <span className="hidden text-center sm:block">
          Blurred until you swipe
        </span>
        <span className="flex items-center gap-2 tabular-nums">
          <span className="relative flex size-2">
            <span className="absolute inset-0 animate-ideacentre-gate-pulse rounded-full bg-red-600/90" />
            <span className="absolute inset-0 rounded-full bg-red-500/40 blur-[2px]" />
          </span>
          Feed live
        </span>
      </div>

      <div className="mx-auto flex w-full max-w-screen-2xl flex-col items-center gap-12 px-4 sm:gap-14 sm:px-6 2xl:max-w-800">
        {/* Typographic stack — centered on page */}
        <div className="relative flex max-w-2xl flex-col items-center text-center">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.35em] text-palette-primary/80">
            Sneak peek
          </p>

          <h2
            id="curiosity-heading"
            className="relative font-impact text-[clamp(3.5rem,14vw,7.5rem)] leading-[0.82] tracking-tight text-foreground"
          >
            <span className="sr-only">
              Sneak peek at ideas waiting in the reel.
            </span>
            <span className="block -rotate-[1.5deg]">
              <ChromaticWord>UNSEEN</ChromaticWord>
            </span>
            <span className="mt-1 block font-display-serif text-[clamp(1.35rem,5vw,2.75rem)] font-normal leading-none tracking-tight text-palette-primary/90">
              ideas
            </span>
          </h2>

          <p className="mt-8 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            Hundreds of ideas are already loaded&nbsp;&mdash; you just
            can&apos;t see them yet. Each one stays blurred until you open the
            reel and swipe.{" "}
            <Link
              href="/reel"
              className="font-semibold text-palette-primary underline decoration-palette-primary/30 underline-offset-[5px] transition-colors hover:text-palette-secondary hover:decoration-palette-secondary/40"
            >
              Start swiping
            </Link>
            .
          </p>
        </div>

        {/* Film gate + sprockets — centered on page */}
        <div className="flex justify-center">
          <div className="relative flex max-w-md items-stretch justify-center gap-0 sm:max-w-lg">
            <div className="hidden sm:flex">
              <SprocketRail />
            </div>

            <div className="relative w-full max-w-88 sm:max-w-96">
              <div className="rounded-[1.75rem] border-[6px] border-palette-primary/22 bg-linear-to-b from-palette-quinary via-card to-muted/35 p-2 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.14),inset_0_1px_0_rgba(255,255,255,0.5)] sm:rounded-[2rem]">
                <div className="relative overflow-hidden rounded-2xl border border-palette-primary/18 bg-linear-to-b from-background to-card shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)] sm:rounded-3xl">
                  <div
                    className="pointer-events-none absolute inset-x-8 top-2 z-10 h-px bg-linear-to-r from-transparent via-palette-primary/22 to-transparent"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute inset-x-8 bottom-12 z-10 h-px bg-linear-to-r from-transparent via-palette-primary/15 to-transparent"
                    aria-hidden
                  />

                  {/* Scanlines */}
                  <div
                    className="pointer-events-none absolute inset-0 z-10 bg-size-[100%_3px] bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.04)_50%)] opacity-[0.2] mix-blend-multiply"
                    aria-hidden
                  />

                  <div
                    className="pointer-events-none absolute left-2.5 top-2.5 z-20 size-5 border-l-2 border-t-2 border-palette-primary/35"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute right-2.5 top-2.5 z-20 size-5 border-r-2 border-t-2 border-palette-primary/35"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute bottom-10 left-2.5 z-20 size-5 border-b-2 border-l-2 border-palette-primary/35"
                    aria-hidden
                  />
                  <div
                    className="pointer-events-none absolute bottom-10 right-2.5 z-20 size-5 border-b-2 border-r-2 border-palette-primary/35"
                    aria-hidden
                  />

                  <div className="relative h-[min(52vh,26rem)] overflow-hidden sm:h-112">
                    <div className="flex flex-col animate-ideacentre-film-feed will-change-transform">
                      {strip.map((t, idx) => (
                        <article
                          key={`${t.hook}-${idx}`}
                          className={cn(
                            "flex min-h-32 shrink-0 flex-col justify-center border-b border-dashed border-palette-primary/12 px-5 py-5 sm:min-h-36 sm:px-7",
                            idx % 2 === 0 ? "bg-card/70" : "bg-muted/30",
                          )}
                          aria-label={`Idea frame ${17 + (idx % teasers.length)}: ${t.hook} ${t.blurLine}`}
                        >
                          <div className="mb-2 flex items-center justify-between gap-3 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                            <span className="tabular-nums">
                              Frame ·{" "}
                              {String(17 + (idx % teasers.length)).padStart(
                                3,
                                "0",
                              )}
                            </span>
                            <span className="rounded border border-palette-primary/20 bg-palette-primary/8 px-1.5 py-0.5 text-[8px] font-bold tracking-wider text-palette-primary">
                              {t.tag}
                            </span>
                          </div>
                          <p className="text-[15px] font-semibold leading-snug text-foreground sm:text-base">
                            {t.hook}
                          </p>
                          <p
                            className="mt-1.5 select-none text-sm leading-snug text-foreground/75 blur-[4.5px] sm:blur-[5px]"
                            aria-hidden
                          >
                            {t.blurLine}
                          </p>
                          <div
                            className="mt-3 h-px w-full bg-linear-to-r from-transparent via-palette-primary/15 to-transparent"
                            aria-hidden
                          />
                        </article>
                      ))}
                    </div>
                  </div>

                  <p className="border-t border-palette-primary/10 bg-muted/25 px-4 py-2.5 text-center font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
                    Swipe to reveal · only in the reel
                  </p>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex">
              <SprocketRail />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
