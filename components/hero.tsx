"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Flame,
  Heart,
  MessageCircle,
  Play,
  Sparkles,
  VolumeX,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

function useFade(delay: number) {
  const reduce = useReducedMotion();
  return {
    initial: false,
    whileInView: reduce
      ? { opacity: 1 }
      : { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true } as const,
    transition: {
      duration: reduce ? 0.01 : 0.35,
      delay: reduce ? 0 : delay,
      ease,
    },
  };
}

/* ─── Floating stat chip ──────────────────────────────────── */
interface ChipProps {
  value: string;
  label: string;
  color: string;
  className?: string;
  delay: number;
  direction?: "left" | "right" | "up" | "down";
}

function Chip({
  value,
  label,
  color,
  className,
  delay,
  direction = "up",
}: ChipProps) {
  const initial =
    direction === "left"
      ? { opacity: 0, x: -20 }
      : direction === "right"
        ? { opacity: 0, x: 20 }
        : direction === "down"
          ? { opacity: 0, y: 20 }
          : { opacity: 0, y: -20 };

  return (
    <motion.div
      className={`absolute z-30 select-none rounded-2xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-white backdrop-blur-xl ${className}`}
      initial={initial}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay, ease }}
    >
      <p className={`text-xl font-semibold tracking-tight ${color}`}>{value}</p>
      <p className="text-[11px] font-medium text-white/55">{label}</p>
    </motion.div>
  );
}

/* ─── Main Hero ───────────────────────────────────────────── */
export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      className="px-4 pb-4 sm:px-6 sm:pb-6 md:pb-8 lg:pb-10"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto w-full max-w-screen-2xl 2xl:max-w-800">
        <motion.div
          className="isolate relative flex min-h-144 flex-col overflow-hidden rounded-2xl bg-palette-primary px-4 py-9 text-primary-foreground sm:min-h-152 sm:px-10 sm:py-10 md:min-h-160 md:px-12 md:py-11 lg:min-h-168 lg:px-12 lg:py-11 xl:min-h-176 xl:rounded-3xl xl:px-14 xl:py-12 2xl:min-h-192 2xl:py-14"
          initial={false}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[url('/texture2.png')] bg-repeat xl:rounded-3xl"
          />
          <div className="relative z-10 grid flex-1 items-center gap-8 lg:grid-cols-[3fr_2fr] lg:gap-10 xl:gap-12">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-8 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-primary-foreground/30 to-transparent lg:block"
            />
            {/* Left column */}
            <div className="flex min-w-0 flex-col gap-6 text-primary-foreground sm:gap-7 lg:max-w-none lg:border-r lg:border-primary-foreground/20 lg:pr-8 xl:pr-10">
              <motion.h1
                id="hero-heading"
                className="font-display-serif text-[3rem] leading-[0.98] tracking-tight sm:text-[4.25rem] md:text-[5rem] lg:text-[5.25rem] xl:text-[6rem]"
                {...useFade(0.15)}
              >
                Startup ideas,
                <br />
                served like{" "}
                <span className="relative inline-block">
                  reels.
                  <span
                    aria-hidden
                    className="absolute -bottom-1 left-0 h-[0.16em] w-full rounded-full bg-[#5FA97C]"
                  />
                </span>
              </motion.h1>

              <motion.p
                className="max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg"
                {...useFade(0.3)}
              >
                Swipe a bottomless feed of startup ideas, save the ones you
                love, upvote the best to the top &mdash; and let AI turn any
                idea into a build-ready plan.
              </motion.p>

              <motion.ul
                className="flex flex-wrap items-center gap-2.5"
                {...useFade(0.4)}
              >
                {["AI", "SaaS", "Productivity", "Consumer", "Dev tools"].map(
                  (feature) => (
                    <li
                      key={feature}
                      className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/25 px-3.5 py-1.5 text-sm font-medium text-primary-foreground/90"
                    >
                      <Check
                        className="size-3.5 text-[#5FA97C]"
                        strokeWidth={3}
                        aria-hidden
                      />
                      {feature}
                    </li>
                  ),
                )}
              </motion.ul>

              <motion.div
                className="mt-1 flex flex-nowrap items-center gap-3 sm:gap-6"
                {...useFade(0.5)}
              >
                <Link
                  href="/reel"
                  className="inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full bg-primary-foreground px-4 py-3 text-[13px] font-bold text-foreground shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/15 active:translate-y-0 sm:px-8 sm:py-3.5 sm:text-[15px]"
                >
                  <Play className="size-4 shrink-0 fill-foreground" aria-hidden />
                  Start the reel
                  <span className="hidden sm:inline">&nbsp;&mdash; it&apos;s free</span>
                </Link>
                <Link
                  href="/reel?feed=trending"
                  className="group inline-flex w-fit items-center gap-1.5 whitespace-nowrap text-[13px] font-medium text-primary-foreground underline underline-offset-4 transition-all duration-200 hover:underline-offset-[6px] sm:gap-2 sm:text-[15px]"
                >
                  <span className="hidden sm:inline">See what&apos;s trending</span>
                  <span className="sm:hidden">Trending</span>
                  <ArrowUpRight
                    className="size-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </motion.div>
            </div>

            {/* Right column — Phone mockup */}
            <motion.div
              className="relative mx-auto w-full max-w-[20rem] lg:mx-0 lg:w-[20rem] lg:justify-self-end lg:mr-14 lg:pl-8 xl:pl-10"
              initial={
                reduce ? false : { opacity: 0, x: 40, filter: "blur(12px)" }
              }
              animate={
                reduce ? undefined : { opacity: 1, x: 0, filter: "blur(0px)" }
              }
              transition={{ duration: 0.9, delay: 0.3, ease }}
            >
              {/* Floating stats */}
              <Chip
                value="Hot #1"
                label="in trending feed"
                color="text-[#3BF09A]"
                className="hidden left-[-3.5rem] top-16 w-32 sm:block"
                delay={0.8}
                direction="left"
              />
              <Chip
                value="+420"
                label="comments in 24h"
                color="text-[#60A5FA]"
                className="hidden right-[-3rem] top-[38%] w-32 sm:block"
                delay={0.95}
                direction="right"
              />
              <Chip
                value="93%"
                label="founder upvotes"
                color="text-[#F472B6]"
                className="hidden bottom-28 left-[-3rem] w-32 sm:block"
                delay={1.05}
                direction="left"
              />
              <Chip
                value="12.4k"
                label="reel plays today"
                color="text-[#FBBF24]"
                className="hidden bottom-10 right-[-2.5rem] w-32 sm:block"
                delay={1.12}
                direction="right"
              />

              {/* Glow behind phone */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-[15%] -bottom-8 h-1/2 blur-[80px]"
                style={{
                  background:
                    "radial-gradient(ellipse at center, rgba(255,255,255,0.2), rgba(255,255,255,0.08) 60%, transparent)",
                }}
              />

              {/* Phone shell */}
              <motion.div
                className="relative mx-auto aspect-[9/17.8] w-full overflow-hidden rounded-[2.6rem] border border-primary-foreground/20 shadow-[0_30px_70px_rgba(0,0,0,0.42),inset_0_0_0_0.5px_rgba(255,255,255,0.18)]"
                style={{ background: "#0e1410" }}
                initial={
                  reduce
                    ? false
                    : {
                        opacity: 0,
                        y: 24,
                        scale: 0.94,
                        rotateX: 9,
                        filter: "blur(8px)",
                      }
                }
                animate={
                  reduce
                    ? undefined
                    : {
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        rotateX: 0,
                        filter: "blur(0px)",
                      }
                }
                transition={{ duration: 0.95, delay: 0.2, ease }}
              >
                {/* Screen chrome */}
                <div className="absolute inset-x-0 top-0 z-20 flex justify-center pt-3">
                  <div className="h-6 w-24 rounded-full bg-black" />
                </div>

                {/* Gradient overlays */}
                <div className="absolute inset-x-0 top-0 z-10 h-32 bg-gradient-to-b from-black/60 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 z-10 h-40 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Background art */}
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(160deg, #0d1a12 0%, #080d10 50%, #110d17 100%)",
                  }}
                />
                <motion.div
                  className="absolute -left-16 -top-16 h-64 w-64 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(59,240,154,0.25), transparent 65%)",
                  }}
                  animate={
                    reduce
                      ? undefined
                      : { x: [0, 12, -8, 0], y: [0, -10, 8, 0] }
                  }
                  transition={{
                    duration: 9,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
                <motion.div
                  className="absolute -bottom-20 -right-16 h-72 w-72 rounded-full"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(244,114,182,0.2), transparent 65%)",
                  }}
                  animate={
                    reduce
                      ? undefined
                      : { x: [0, -10, 14, 0], y: [0, 10, -8, 0] }
                  }
                  transition={{
                    duration: 11,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                {/* Content */}
                <div className="relative z-20 flex h-full flex-col justify-between p-5 pt-10">
                  {/* Top bar */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                      <Flame
                        className="size-3 text-[#A6D4BB]"
                        strokeWidth={2.5}
                      />
                      Idea Reel
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/8 px-2 py-1 text-[10px] text-white/60 backdrop-blur-sm"
                    >
                      <VolumeX className="size-3" />
                    </button>
                  </div>

                  {/* Card content */}
                  <div className="space-y-3.5">
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#3BF09A]/70">
                      AI / Productivity
                    </p>

                    <p
                      className="text-[1.2rem] font-bold leading-[1.2] text-white"
                      style={{
                        fontFamily:
                          '"Helvetica Neue", Helvetica, Arial, sans-serif',
                      }}
                    >
                      AI Rehearsal Coach For Startup Pitches
                    </p>

                    <p className="text-[11px] leading-relaxed text-white/55">
                      Practice your pitch in 60 seconds and get instant scoring
                      + feedback from real founders.
                    </p>

                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                      <Play className="size-3 fill-white/40 text-white/40" />
                      <span>Swipe up for next idea</span>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div className="flex items-end justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-semibold text-white/80">
                        by IdeaCrew
                      </p>
                      <p className="font-mono text-[9px] text-white/35">
                        #pitch #startup #ai
                      </p>
                    </div>

                    <div className="flex flex-col items-center gap-3.5">
                      <ActionBtn
                        icon={<Heart className="size-4 text-[#A6D4BB]" />}
                        count="1.8k"
                      />
                      <ActionBtn
                        icon={
                          <MessageCircle className="size-4 text-[#C7DFD2]" />
                        }
                        count="420"
                      />
                      <ActionBtn
                        icon={<Sparkles className="size-4 text-[#D8E8DF]" />}
                        count="AI"
                      />
                    </div>
                  </div>
                </div>

                {/* Progress dots */}
                <div className="absolute bottom-2 left-1/2 z-30 flex -translate-x-1/2 gap-1">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className="h-0.5 rounded-full transition-all duration-300"
                      style={{
                        width: i === 1 ? 18 : 5,
                        background:
                          i === 1
                            ? "rgba(216,232,223,0.95)"
                            : "rgba(255,255,255,0.28)",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Small helper ────────────────────────────────────────── */
function ActionBtn({ icon, count }: { icon: React.ReactNode; count: string }) {
  return (
    <span className="flex flex-col items-center gap-0.5 text-[10px] text-white/55">
      {icon}
      {count}
    </span>
  );
}
