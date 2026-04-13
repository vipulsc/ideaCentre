"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { taglines } from "@/data/taglines";

const ROTATE_MS = 6500;

export function Tagline() {
  const [index, setIndex] = useState(0);
  const line = taglines[index] ?? taglines[0];
  const letters = Array.from(line);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (taglines.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % taglines.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="w-full py-8 sm:py-10 md:py-12 lg:py-16" aria-labelledby="tagline-heading">
      <h2
        id="tagline-heading"
        className="font-display-serif flex w-full flex-wrap justify-center gap-y-1 px-6 text-center text-3xl leading-tight tracking-tight sm:text-4xl md:text-5xl lg:text-6xl"
        aria-live={taglines.length > 1 ? "polite" : undefined}
      >
        {letters.map((char, i) => {
          const isSpace = char === " ";
          const content = isSpace ? "\u00A0" : char;
          const key = `${index}-${i}-${char}`;

          if (reduceMotion) {
            return (
              <span
                key={key}
                className={
                  isSpace
                    ? "tagline-text-fill inline-block min-w-[0.35em]"
                    : "tagline-text-fill inline-block"
                }
              >
                {content}
              </span>
            );
          }

          return (
            <motion.span
              key={key}
              className={
                isSpace
                  ? "tagline-text-fill inline-block min-w-[0.35em]"
                  : "tagline-text-fill inline-block"
              }
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={{ clipPath: "inset(0 0% 0 0)" }}
              transition={{
                delay: i * 0.055,
                duration: 0.42,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {content}
            </motion.span>
          );
        })}
      </h2>
    </section>
  );
}
