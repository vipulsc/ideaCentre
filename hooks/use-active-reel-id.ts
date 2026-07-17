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

  const [activeId, setActiveId] = useState<string | null>(stableIds[0] ?? null);

  useEffect(() => {
    if (!enabled) {
      setActiveId(null);
      return;
    }
    if (stableIds.length === 0) {
      setActiveId(null);
      return;
    }
    setActiveId((prev) =>
      prev && stableIds.includes(prev) ? prev : (stableIds[0] ?? null),
    );
  }, [stableIds, enabled]);

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
        if (id) setActiveId(id);
      },
      { root, threshold: [0.55, 0.75, 0.9] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [scrollRef, stableIds, enabled]);

  return activeId;
}
