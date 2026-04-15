"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Lightbulb } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

function useFade(delay: number) {
  const reduce = useReducedMotion();
  return {
    initial: reduce
      ? { opacity: 0 }
      : { opacity: 0, y: 18, filter: "blur(4px)" },
    whileInView: reduce
      ? { opacity: 1 }
      : { opacity: 1, y: 0, filter: "blur(0px)" },
    viewport: { once: true } as const,
    transition: { duration: reduce ? 0.15 : 0.6, delay, ease },
  };
}

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section
      className="px-4 pb-8 sm:px-6 sm:pb-10 md:pb-12  lg:pb-16"
      aria-labelledby="hero-heading"
    >
      <div className="mx-auto w-full max-w-screen-2xl 2xl:max-w-800">
        <motion.div
          className="isolate relative overflow-hidden rounded-2xl bg-palette-primary px-4 py-10 text-primary-foreground sm:px-10 sm:py-12 md:px-12 md:py-14 lg:px-12 lg:py-16 xl:rounded-3xl xl:px-14 xl:py-20"
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          whileInView={reduce ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl bg-[url('/texture2.png')] bg-repeat xl:rounded-3xl"
          />
          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2 lg:gap-12 xl:gap-16">
            <div className="flex min-w-0 flex-col gap-6 text-primary-foreground sm:gap-7 lg:max-w-xl lg:gap-8">
              {/* Badge */}
              <motion.div
                className="flex items-center gap-3"
                {...useFade(0.15)}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
                  <Lightbulb className="size-6 text-primary-foreground" />
                </span>
                <div>
                  <p className="text-sm font-bold leading-tight text-primary-foreground sm:text-base">
                    1,000+ Ideas
                  </p>
                  <p className="text-sm text-primary-foreground/80">
                    See What&apos;s{" "}
                    <span className="font-bold underline underline-offset-2">
                      Trending Now
                    </span>
                  </p>
                </div>
              </motion.div>

              {/* Heading */}
              <motion.h1
                id="hero-heading"
                className="font-display-serif text-[5rem] leading-[0.9] tracking-tight sm:text-[7rem] md:text-[8rem] lg:text-[9rem] xl:text-[10rem]"
                {...useFade(0.3)}
              >
                Idea
                <sup className="relative -top-[0.35em] text-[0.4em]">+</sup>
              </motion.h1>

              {/* Divider */}
              <motion.hr
                className="border-primary-foreground/25"
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={reduce ? undefined : { scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.45, ease }}
                style={{ transformOrigin: "left" }}
              />

              {/* Description */}
              <motion.p
                className="max-w-lg text-base leading-relaxed text-primary-foreground/90 sm:text-lg md:text-xl"
                {...useFade(0.5)}
              >
                Discover Startup Ideas In Seconds. Swipe Through Ideas Like
                Reels&nbsp;&mdash; Save, Vote, And Start Building.
              </motion.p>

              {/* Divider */}
              <motion.hr
                className="border-primary-foreground/25"
                initial={reduce ? false : { scaleX: 0 }}
                whileInView={reduce ? undefined : { scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6, ease }}
                style={{ transformOrigin: "left" }}
              />

              {/* CTA Buttons */}
              <motion.div
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6"
                {...useFade(0.65)}
              >
                <Link
                  href="#get-started"
                  className="inline-flex w-fit items-center justify-center rounded-full bg-primary-foreground px-8 py-3.5 text-sm font-medium text-primary shadow-lg shadow-black/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/15 active:translate-y-0 sm:px-9 sm:py-4 sm:text-[15px]"
                >
                  <span className="font-bold">Start Idea Reel</span>
                  &nbsp;&mdash; It&apos;s Free
                </Link>
                <Link
                  href="#trending"
                  className="group inline-flex w-fit items-center gap-2 text-sm font-medium text-primary-foreground underline underline-offset-4 transition-all duration-200 hover:underline-offset-[6px] sm:text-[15px]"
                >
                  See Trending
                  <ArrowUpRight
                    className="size-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              </motion.div>
            </div>

            {/* Right column — image + floating cards */}
            <motion.div
              className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
              initial={reduce ? false : { opacity: 0, x: 30 }}
              whileInView={reduce ? undefined : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.35, ease }}
            >
              <div
                className="pointer-events-none absolute -bottom-4 -right-2 z-0 h-[78%] w-[58%] rounded-md bg-linear-to-br from-orange-400 via-orange-300 to-[#ffd8b8] sm:-bottom-6 sm:-right-4 sm:rounded-lg lg:h-[82%] lg:w-[52%] lg:rounded-lg"
                aria-hidden
              />

              <div className="relative z-10 mx-auto aspect-4/5 w-full max-w-[min(100%,20rem)] overflow-hidden rounded-md sm:max-w-xs sm:rounded-lg md:max-w-sm lg:ml-auto lg:mr-0 lg:max-w-md xl:max-w-lg">
                <Image
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80"
                  alt="Team lead reviewing growth metrics"
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 1024px) 90vw, 480px"
                  priority
                />
              </div>

              {/* Floating stat card */}
              <motion.div
                className="absolute right-0 top-6 z-20 w-[min(100%,11rem)] rounded-lg border border-primary/15 bg-primary-foreground/95 px-4 py-3 shadow-lg backdrop-blur-md sm:right-2 sm:top-8 sm:w-44"
                initial={reduce ? false : { opacity: 0, y: -12, scale: 0.92 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.7, ease }}
              >
                <p className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                  60%
                </p>
                <p className="text-xs font-medium text-primary/70 sm:text-sm">
                  Pipeline won this quarter
                </p>
              </motion.div>

              {/* Floating product card */}
              <motion.div
                className="absolute bottom-[18%] left-0 z-20 flex max-w-44 items-center gap-3 rounded-lg border border-primary/15 bg-primary-foreground/95 px-3 py-2.5 shadow-lg backdrop-blur-md sm:bottom-[20%] sm:left-2 sm:max-w-xs sm:px-4 sm:py-3"
                initial={reduce ? false : { opacity: 0, y: 12, scale: 0.92 }}
                whileInView={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.85, ease }}
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary text-lg text-primary-foreground">
                  ✓
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary">
                    Nike Air Max
                  </p>
                  <p className="text-xs text-primary/70">Featured launch</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
