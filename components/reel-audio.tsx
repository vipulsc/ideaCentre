"use client";

import { useEffect, useRef } from "react";

type ReelAudioProps = {
  src?: string | null;
  active: boolean;
  muted: boolean;
  onAutoplayBlocked?: () => void;
};

/**
 * Plays only while `active`. Pauses + resets when the reel leaves view
 * so scrolling never stacks the same/overlapping tracks.
 */
export function ReelAudio({
  src,
  active,
  muted,
  onAutoplayBlocked,
}: ReelAudioProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blockedNotifiedRef = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !src) return;

    audio.muted = muted;

    if (!active) {
      audio.pause();
      try {
        audio.currentTime = 0;
      } catch {
        // ignore
      }
      return;
    }

    let cancelled = false;

    const tryPlay = () => {
      if (cancelled) return;
      void audio.play().then(
        () => {
          blockedNotifiedRef.current = false;
        },
        () => {
          if (!muted && !blockedNotifiedRef.current) {
            blockedNotifiedRef.current = true;
            onAutoplayBlocked?.();
          }
        },
      );
    };

    if (audio.readyState >= 2) {
      tryPlay();
    } else {
      const onReady = () => tryPlay();
      audio.addEventListener("canplay", onReady);
      audio.load();
      return () => {
        cancelled = true;
        audio.removeEventListener("canplay", onReady);
      };
    }

    return () => {
      cancelled = true;
    };
  }, [src, active, muted, onAutoplayBlocked]);

  if (!src) return null;

  return (
    <audio
      ref={audioRef}
      key={src}
      src={src}
      loop
      playsInline
      preload="auto"
      className="hidden"
    />
  );
}
