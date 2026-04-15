"use client";

import { type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  type Variant,
} from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "none";

const offsets: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 24 },
  down: { x: 0, y: -24 },
  left: { x: 24, y: 0 },
  right: { x: -24, y: 0 },
  none: { x: 0, y: 0 },
};

interface RevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.55,
  className,
  once = true,
  amount = 0.2,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  const { x, y } = offsets[direction];

  const hidden: Variant = reduceMotion
    ? { opacity: 0 }
    : { opacity: 0, x, y, filter: "blur(4px)" };

  const visible: Variant = reduceMotion
    ? { opacity: 1 }
    : { opacity: 1, x: 0, y: 0, filter: "blur(0px)" };

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden,
        visible: {
          ...visible,
          transition: {
            duration: reduceMotion ? 0.15 : duration,
            delay,
            ease: [0.22, 1, 0.36, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
