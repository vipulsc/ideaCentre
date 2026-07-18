"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

type ZoomSequenceProps = {
  /** The section the visitor lands on (e.g. the hero). */
  first: React.ReactNode;
  /** The section the camera zooms into next (e.g. the tagline). */
  second: React.ReactNode;
  className?: string;
  /** Scroll distance the pin holds, as a % of viewport height. Bigger = slower. */
  pinLength?: number;
};

/**
 * A landing "camera move": the visitor arrives on `first` (hero). On the first
 * scroll the stage pins and the camera flies out of `first` and zooms into
 * `second` (tagline) — instead of the page scrolling. Scrolling further releases
 * the pin so the rest of the site scrolls in normally.
 *
 * Desktop only (pinning / scroll-lock). On smaller screens and under
 * `prefers-reduced-motion` both sections simply stack and flow normally, so the
 * layout, content, SSR/SEO output and accessibility are all preserved.
 */
export function ZoomSequence({
  first,
  second,
  className,
  pinLength = 150,
}: ZoomSequenceProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const firstRef = useRef<HTMLDivElement>(null);
  const secondRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const firstEl = firstRef.current;
    const secondEl = secondRef.current;
    if (!outer || !firstEl || !secondEl) return;

    gsap.registerPlugin(ScrollTrigger);

    const mm = gsap.matchMedia();

    // ── Desktop: pinned zoom from hero → tagline, then unlock the rest ──────
    mm.add(
      "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
      () => {
        outer.classList.add("zoom-seq--active");

        gsap.set(firstEl, { scale: 1, autoAlpha: 1, filter: "blur(0px)" });
        gsap.set(secondEl, {
          scale: 0.32,
          autoAlpha: 0,
          filter: "blur(16px)",
        });

        const tl = gsap.timeline({
          defaults: { ease: "none", force3D: true },
          scrollTrigger: {
            trigger: outer,
            start: "top top",
            end: `+=${pinLength}%`,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            scrub: 1,
          },
        });

        // Camera flies out of the hero...
        tl.to(
          firstEl,
          { scale: 1.7, autoAlpha: 0, filter: "blur(14px)" },
          0,
        );
        // ...and zooms into the tagline, which settles full-frame.
        tl.to(
          secondEl,
          { scale: 1, autoAlpha: 1, filter: "blur(0px)" },
          0.22,
        );

        return () => {
          outer.classList.remove("zoom-seq--active");
          gsap.set([firstEl, secondEl], {
            clearProps: "transform,opacity,visibility,filter",
          });
        };
      },
    );

    // ── Mobile / tablet: gentle zoom-in on the tagline, normal flow ────────
    mm.add(
      "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
      () => {
        gsap.fromTo(
          secondEl,
          { scale: 0.8, autoAlpha: 0.4, filter: "blur(8px)" },
          {
            scale: 1,
            autoAlpha: 1,
            filter: "blur(0px)",
            ease: "power2.out",
            force3D: true,
            scrollTrigger: {
              trigger: secondEl,
              start: "top 92%",
              end: "top 45%",
              scrub: 0.6,
            },
          },
        );
      },
    );

    return () => mm.revert();
  }, [pinLength]);

  return (
    <div ref={outerRef} className={cn("zoom-seq", className)}>
      <div className="zoom-seq__stage">
        <div ref={firstRef} className="zoom-seq__layer zoom-seq__layer--top">
          {first}
        </div>
        <div ref={secondRef} className="zoom-seq__layer zoom-seq__layer--center">
          {second}
        </div>
      </div>
    </div>
  );
}
