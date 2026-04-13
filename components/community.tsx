import Image from "next/image";
import {
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Send,
} from "lucide-react";

const floatingCards = [
  {
    idea: "AI that turns voice memos into PRDs",
    votes: 342,
    tag: "AI",
  },
  {
    idea: "Marketplace for micro-SaaS templates",
    votes: 218,
    tag: "SaaS",
  },
  {
    idea: "Browser extension that blocks doom-scrolling",
    votes: 189,
    tag: "Productivity",
  },
];

export function Community() {
  return (
    <section className="px-6 py-8 sm:py-10 md:py-12 lg:py-16" aria-labelledby="community-heading">
      <div className="mx-auto w-full max-w-screen-2xl 2xl:max-w-400">
        <div className="overflow-hidden rounded-2xl border border-border bg-card xl:rounded-3xl">
          <div className="grid items-center lg:grid-cols-2">
            {/* Left — Text */}
            <div className="flex flex-col gap-6 p-8 sm:gap-8 sm:p-12 lg:p-14 xl:p-16">
              <Image
                src="/logo1.svg"
                alt="IdeaCentre"
                width={40}
                height={40}
                className="object-contain"
              />

              <h2
                id="community-heading"
                className="font-display-serif text-3xl leading-tight tracking-tight text-foreground sm:text-4xl md:text-5xl"
              >
                Share ideas.
                <br />
                Let the crowd decide.
              </h2>

              <p className="max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
                Every idea you post gets seen, voted on, and ranked by real
                builders. The best ones rise — no gatekeepers, no pitch decks,
                just community validation in real time.
              </p>

              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Send, label: "Submit your idea" },
                  { icon: ThumbsUp, label: "Upvote what excites you" },
                  { icon: TrendingUp, label: "Watch it trend" },
                ].map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-foreground"
                  >
                    <item.icon className="size-4 text-palette-primary" />
                    {item.label}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex -space-x-2.5">
                  {["A", "K", "R", "M"].map((letter) => (
                    <span
                      key={letter}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-card bg-palette-primary/15 text-xs font-bold text-palette-primary"
                    >
                      {letter}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">2,400+</span>{" "}
                  builders already sharing ideas
                </p>
              </div>
            </div>

            {/* Right — Floating idea cards */}
            <div className="relative hidden min-h-112 lg:block">
              <div
                className="absolute inset-0 bg-linear-to-br from-palette-primary/5 via-palette-tertiary/10 to-palette-quinary/20"
                aria-hidden
              />

              {floatingCards.map((card, i) => {
                const positions = [
                  "left-8 top-10 rotate-[-2deg]",
                  "right-8 top-1/2 -translate-y-1/2 rotate-[1.5deg]",
                  "left-16 bottom-10 rotate-[2deg]",
                ];
                return (
                  <div
                    key={card.idea}
                    className={`absolute z-10 w-64 rounded-xl border border-border bg-background p-5 shadow-md transition-transform hover:scale-105 ${positions[i]}`}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-full bg-palette-primary/10 px-2.5 py-0.5 text-xs font-semibold text-palette-primary">
                        {card.tag}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MessageSquare className="size-3" />
                        {Math.floor(card.votes / 3)}
                      </span>
                    </div>

                    <p className="mb-4 text-sm font-semibold leading-snug text-foreground">
                      {card.idea}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-md bg-palette-primary/10 px-2.5 py-1 text-xs font-medium text-palette-primary"
                          aria-label={`${card.votes} upvotes`}
                        >
                          <ThumbsUp className="size-3.5" />
                          {card.votes}
                        </button>
                        <button
                          type="button"
                          className="flex items-center gap-1 rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
                          aria-label="Downvote"
                        >
                          <ThumbsDown className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
