"use client";

import { Scroll, Bookmark, Rocket } from "lucide-react";
import { Reveal } from "@/components/reveal";

const steps = [
  {
    number: "01",
    icon: Scroll,
    title: "Swipe Ideas",
    description:
      "Scroll through a never-ending feed of startup ideas — just like reels. Each card is short, clear, and ready to inspire.",
  },
  {
    number: "02",
    icon: Bookmark,
    title: "Save What Clicks",
    description:
      "Found something worth building? Bookmark it instantly. Your saved ideas live in one place, ready when you are.",
  },
  {
    number: "03",
    icon: Rocket,
    title: "Start Building",
    description:
      "Vote on ideas you believe in, submit your own, and watch the community surface what deserves to exist.",
  },
] as const;

export function HowItWorks() {
  return (
    <section
      className="px-4 py-8 sm:px-6 sm:py-10 md:py-12 lg:py-16"
      aria-labelledby="how-it-works-heading"
    >
      <div className="mx-auto w-full max-w-screen-2xl 2xl:max-w-800">
        <div className="mb-8 flex max-w-2xl flex-col gap-3 sm:mb-10">
          <Reveal direction="up">
            <p className="text-sm font-semibold uppercase tracking-widest text-palette-primary">
              How it works
            </p>
          </Reveal>
          <Reveal direction="up" delay={0.1}>
            <h2
              id="how-it-works-heading"
              className="font-display-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl"
            >
              Idea discovery,
              <br />
              stupidly simple.
            </h2>
          </Reveal>
          <Reveal direction="up" delay={0.2}>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              Three steps. Zero friction. Go from browsing to building in
              under a minute.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {steps.map((step, i) => (
            <Reveal
              key={step.number}
              direction="up"
              delay={0.15 + i * 0.12}
            >
              <div className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg sm:p-9">
                <span className="absolute -right-2 -top-3 font-display-serif text-[7rem] leading-none text-palette-primary/6 transition-colors duration-200 group-hover:text-palette-primary/12 sm:text-[8rem]">
                  {step.number}
                </span>

                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-palette-primary/10 transition-colors duration-200 group-hover:bg-palette-primary/15">
                      <step.icon className="size-5 text-palette-primary" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-palette-primary/50">
                      Step {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold tracking-tight text-foreground">
                    {step.title}
                  </h3>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
