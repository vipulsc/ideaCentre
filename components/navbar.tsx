"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const SCROLL_REVEAL_AT = 56;
const SCROLL_HIDE_BELOW = 32;

function NavbarNav() {
  return (
    <nav
      className="relative isolate min-h-14 w-full text-foreground"
      aria-label="Main"
    >
      <Link
        href="/"
        className="absolute inset-s-0 top-1/2 max-w-[min(45%,11rem)] -translate-y-1/2 truncate text-sm font-semibold tracking-tight text-foreground hover:opacity-80 sm:text-base md:text-lg lg:text-xl"
      >
        ideaCentre
      </Link>
      <Link
        href="#get-started"
        className="absolute inset-e-0 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-primary bg-transparent px-5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-primary/5 sm:text-sm md:text-base lg:text-lg"
      >
        Get it Now - It&apos;s Free
      </Link>
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
      <div className="relative overflow-hidden rounded-full border border-primary-foreground/25 bg-linear-to-b from-card/45 via-background/30 to-card/40 px-4 py-2.5 shadow-[0_18px_50px_-14px_rgba(62,42,28,0.32)] ring-1 ring-inset ring-primary-foreground/15 backdrop-blur-3xl backdrop-saturate-150 supports-backdrop-filter:from-card/35 supports-backdrop-filter:via-background/22 supports-backdrop-filter:to-card/32 sm:px-6 sm:py-3">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-20%,color-mix(in_srgb,var(--palette-quinary)_42%,transparent),transparent_60%)]"
        />
        <nav
          className="relative flex w-full items-center justify-between gap-4 sm:gap-8"
          aria-label="Main"
        >
          <Link
            href="/"
            className="min-w-0 truncate text-sm font-semibold tracking-tight text-foreground transition-opacity hover:opacity-80 sm:text-base md:text-lg"
          >
            ideaCentre
          </Link>
          <Link
            href="#get-started"
            className="shrink-0 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[inset_0_1px_0_color-mix(in_srgb,var(--palette-quinary)_55%,transparent),0_4px_14px_-4px_rgba(62,42,28,0.45)] transition-[transform,box-shadow,opacity] hover:-translate-y-px hover:opacity-[0.97] hover:shadow-[inset_0_1px_0_color-mix(in_srgb,var(--palette-quinary)_55%,transparent),0_8px_22px_-6px_rgba(62,42,28,0.5)] active:translate-y-0 sm:px-5 sm:py-2.5 sm:text-sm md:text-base"
          >
            Get it Now - It&apos;s Free
          </Link>
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
        className="w-full px-12 py-4"
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
