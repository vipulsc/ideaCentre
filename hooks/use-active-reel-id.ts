"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Tracks which snap-reel card is mostly visible inside a scroll container.
 */
export function useActiveReelId(
  scrollRef: React.RefObject<HTMLElement | null>,
  itemIds: string[],
  enabled = true,
) {
  const idsKey = itemIds.join("|");
  const stableIds = useMemo(() => itemIds, [idsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // The id last reported by the IntersectionObserver (set inside a callback,
  // never synchronously in an effect body).
  const [observedId, setObservedId] = useState<string | null>(null);

  // Derive the active id so enabled/empty/stale transitions don't require a
  // synchronous setState inside an effect.
  const activeId = useMemo(() => {
    if (!enabled || stableIds.length === 0) return null;
    if (observedId && stableIds.includes(observedId)) return observedId;
    return stableIds[0] ?? null;
  }, [enabled, stableIds, observedId]);

  useEffect(() => {
    const root = scrollRef.current;
    if (!root || !enabled || stableIds.length === 0) return;

    const elements = stableIds
      .map((id) =>
        root.querySelector<HTMLElement>(`[data-reel-idea-id="${CSS.escape(id)}"]`),
      )
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = (top?.target as HTMLElement | undefined)?.dataset
          ?.reelIdeaId;
        if (id) setObservedId(id);
      },
      { root, threshold: [0.55, 0.75, 0.9] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [scrollRef, stableIds, enabled]);

  return activeId;
}
