"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

type CinematicSectionProps = {
  children: React.ReactNode;
  className?: string;
  /** Scale the section starts at as it enters the viewport. */
  enterScale?: number;
  /** Scale the section settles to once it recedes past the viewport. */
  exitScale?: number;
  /** Play the reveal-on-enter animation. Disable for above-the-fold heroes. */
  reveal?: boolean;
  /** Play the recede-on-exit animation. */
  recede?: boolean;
};

/**
 * Wraps a section and animates it with a scroll-linked "camera" move:
 * it scales up + de-blurs + fades in as it enters the viewport, then gently
 * scales down + blurs as it leaves — creating the feeling of moving through
 * a cinematic space rather than scrolling a flat page.
 *
 * Content is never hidden via CSS, so SSR/SEO output is untouched and the
 * layout is preserved. All motion is GPU-accelerated (transform + opacity)
 * and fully disabled under `prefers-reduced-motion`.
 */
export function CinematicSection({
  children,
  className,
  enterScale = 0.86,
  exitScale = 0.93,
  reveal = true,
  recede = true,
}: CinematicSectionProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (reveal) {
        gsap.fromTo(
          el,
          { scale: enterScale, autoAlpha: 0.4, filter: "blur(14px)", yPercent: 6 },
          {
            scale: 1,
            autoAlpha: 1,
            filter: "blur(0px)",
            yPercent: 0,
            ease: "power2.out",
            force3D: true,
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              end: "top 50%",
              scrub: 0.8,
            },
          },
        );
      }

      if (recede) {
        gsap.fromTo(
          el,
          { scale: 1, autoAlpha: 1, filter: "blur(0px)", yPercent: 0 },
          {
            scale: exitScale,
            autoAlpha: 0.55,
            filter: "blur(6px)",
            yPercent: -6,
            ease: "power2.in",
            force3D: true,
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: "bottom 62%",
              end: "bottom 6%",
              scrub: 0.8,
            },
          },
        );
      }
    }, el);

    return () => ctx.revert();
  }, [enterScale, exitScale, reveal, recede]);

  return (
    <div ref={wrapperRef} className={cn("cinematic-section", className)}>
      {children}
    </div>
  );
}
