"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { signInWithGoogle } from "@/lib/auth-client";

const SHOW_MS = 3000;
const HIDE_MS = 2000;

export function PostIdeaFab() {
  const [visible, setVisible] = useState(true);
  const reduce = useReducedMotion();

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function schedule(currentlyVisible: boolean) {
      timeout = setTimeout(
        () => {
          setVisible((v) => {
            const next = !v;
            schedule(next);
            return next;
          });
        },
        currentlyVisible ? SHOW_MS : HIDE_MS,
      );
    }

    schedule(true);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 sm:bottom-8 sm:right-8">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.span
            key="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-3.5 py-1.5 text-xs font-semibold text-background shadow-lg"
            initial={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: 8, scale: 0.92, filter: "blur(6px)" }
            }
            animate={
              reduce
                ? { opacity: 1 }
                : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            }
            exit={
              reduce
                ? { opacity: 0 }
                : { opacity: 0, y: -6, scale: 0.95, filter: "blur(6px)" }
            }
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
              mass: 0.8,
              opacity: { duration: 0.6, ease: "easeInOut" },
              filter: { duration: 0.6, ease: "easeInOut" },
            }}
          >
            Post your idea
            <span
              className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-foreground"
              aria-hidden
            />
          </motion.span>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => signInWithGoogle("/dashboard")}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-shadow duration-200 hover:shadow-xl hover:shadow-primary/40"
        aria-label="Post your idea"
      >
        <Plus className="size-6" strokeWidth={2.5} />
      </button>
    </div>
  );
}
