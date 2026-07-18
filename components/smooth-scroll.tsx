"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

/**
 * Drives the whole page with Lenis smooth scrolling and syncs it to GSAP's
 * ticker + ScrollTrigger so every scroll-linked animation stays frame-perfect.
 *
 * - Respects `prefers-reduced-motion` (falls back to native scrolling, no Lenis).
 * - Uses native touch scrolling on mobile for best performance / no jank.
 * - Cleans up fully on unmount so other routes keep native scrolling.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Keep native, GPU-cheap touch scrolling on mobile.
      syncTouch: false,
    });

    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Recalculate trigger positions once layout/fonts settle.
    ScrollTrigger.refresh();
    const onFonts = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(onFonts).catch(() => {});

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
