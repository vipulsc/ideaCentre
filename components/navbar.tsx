"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import LoginButton from "@/components/login-button";

const SCROLL_REVEAL_AT = 56;
const SCROLL_HIDE_BELOW = 32;

function IdeaCentreWordmark({
  sizeClassName,
  className,
}: {
  sizeClassName: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex min-w-0 items-baseline gap-px leading-none",
        sizeClassName,
        className,
      )}
    >
      <span className="font-display-serif font-normal tracking-tight text-foreground transition-colors duration-200 group-hover:text-palette-primary/90">
        idea
      </span>
      <span className="font-display-serif font-semibold tracking-tight text-palette-primary transition-colors duration-200 group-hover:text-palette-secondary">
        Centre
      </span>
    </span>
  );
}

function NavbarNav() {
  return (
    <nav
      className="relative isolate flex min-h-14 w-full items-center justify-between text-foreground"
      aria-label="Main"
    >
      <Link
        href="/"
        className="group max-w-[min(45%,12rem)] truncate overflow-hidden hover:opacity-95 sm:max-w-52"
        aria-label="ideaCentre home"
      >
        <IdeaCentreWordmark sizeClassName="text-sm sm:text-base md:text-lg lg:text-xl" />
      </Link>
      <div className="flex items-center gap-2 sm:gap-3">
        <LoginButton
          className="text-xs font-medium text-foreground/70 transition-colors hover:text-foreground sm:text-sm"
        />
        <Link
          href="/reel"
          className="whitespace-nowrap rounded-full border border-primary bg-transparent px-5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary/5 sm:text-sm"
        >
          Start Reel
        </Link>
      </div>
    </nav>
  );
}

/** Scroll-reveal only: floating dock, not a full-width bar */
function NavbarScrollDock() {
  return (
    <div className="relative w-full max-w-xl sm:max-w-2xl">
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-full bg-linear-to-br from-palette-secondary/45 via-palette-primary/35 to-palette-tertiary/50 opacity-90 blur-sm"
      />
      <div className="relative overflow-visible rounded-full border border-primary-foreground/25 bg-linear-to-b from-card/45 via-background/30 to-card/40 px-4 py-2.5 shadow-[0_18px_50px_-14px_rgba(62,42,28,0.32)] ring-1 ring-inset ring-primary-foreground/15 backdrop-blur-3xl backdrop-saturate-150 supports-backdrop-filter:from-card/35 supports-backdrop-filter:via-background/22 supports-backdrop-filter:to-card/32 sm:px-6 sm:py-3">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-full bg-[radial-gradient(120%_80%_at_50%_-20%,color-mix(in_srgb,var(--palette-quinary)_42%,transparent),transparent_60%)]"
        />
        <nav
          className="relative flex w-full items-center justify-between gap-4 sm:gap-8"
          aria-label="Main"
        >
          <Link
            href="/"
            className="group min-w-0 max-w-full truncate overflow-hidden transition-opacity hover:opacity-95"
            aria-label="ideaCentre home"
          >
            <IdeaCentreWordmark sizeClassName="text-sm sm:text-base md:text-lg" />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <LoginButton
              className="text-xs font-medium text-foreground/70 transition-colors hover:text-foreground sm:text-sm"
            />
            <Link
              href="/reel"
              className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[inset_0_1px_0_color-mix(in_srgb,var(--palette-quinary)_55%,transparent),0_4px_14px_-4px_rgba(62,42,28,0.45)] transition-[transform,box-shadow,opacity] hover:-translate-y-px hover:opacity-[0.97] hover:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--palette-quinary)_55%,transparent),0_8px_22px_-6px_rgba(62,42,28,0.5)] active:translate-y-0 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Start Reel
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}

export function Navbar() {
  const { scrollY } = useScroll();
  const reduceMotion = useReducedMotion();
  const [reveal, setReveal] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > SCROLL_REVEAL_AT) setReveal(true);
    else if (latest < SCROLL_HIDE_BELOW) setReveal(false);
  });

  return (
    <>
      <header
        className="relative z-40 w-full px-4 py-4 sm:px-12"
        aria-hidden={reveal}
        inert={reveal ? true : undefined}
      >
        <NavbarNav />
      </header>

      <motion.header
        className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-2 sm:px-8 sm:pt-3"
        initial={false}
        animate={{ y: reveal ? 0 : "-130%" }}
        transition={
          reduceMotion
            ? { duration: 0.2, ease: "easeOut" }
            : { type: "spring", stiffness: 380, damping: 32, mass: 0.72 }
        }
        aria-hidden={!reveal}
        inert={!reveal ? true : undefined}
      >
        <motion.div
          className="pointer-events-auto flex w-full max-w-xl justify-center sm:max-w-2xl"
          initial={false}
          animate={
            reduceMotion
              ? {}
              : {
                  opacity: reveal ? 1 : 0.85,
                  scale: reveal ? 1 : 0.94,
                  rotateX: reveal ? 0 : -6,
                }
          }
          transition={
            reduceMotion
              ? { duration: 0 }
              : { type: "spring", stiffness: 420, damping: 30, mass: 0.55 }
          }
          style={{ perspective: 1000 }}
        >
          <NavbarScrollDock />
        </motion.div>
      </motion.header>
    </>
  );
}
