"use client";

import {
  FileText,
  Flame,
  Heart,
  LogIn,
  MessageCircle,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiInsightsModal } from "@/components/ai-insights-modal";
import { ReelAudio } from "@/components/reel-audio";
import { useActiveReelId } from "@/hooks/use-active-reel-id";
import { shareIdea } from "@/lib/share";

type FeedIdea = {
  id: string;
  title: string;
  idea: string;
  description?: string | null;
  category: string;
  color: string;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  authorName: string;
  authorImage?: string | null;
  trending: boolean;
  music?: string | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function ReelPageContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const isAuthed = status === "authenticated";
  const [ideas, setIdeas] = useState<FeedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [insightsIdeaId, setInsightsIdeaId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cursorRef = useRef(0);
  const likeInFlightRef = useRef(new Set<string>());
  const scrollRef = useRef<HTMLDivElement>(null);
  const deepLinkHandled = useRef(false);

  const showTrendingOnly = searchParams.get("feed") === "trending";
  const deepLinkIdeaId = searchParams.get("idea");

  const visibleIdeas = showTrendingOnly
    ? ideas.filter((idea) => idea.trending)
    : ideas;

  const reelItemIds = useMemo(
    () => visibleIdeas.map((idea) => idea.id),
    [visibleIdeas],
  );
  const activeReelId = useActiveReelId(scrollRef, reelItemIds, true);

  const selectedIdea =
    visibleIdeas.find((i) => i.id === selectedIdeaId) ?? null;
  const insightsIdea =
    ideas.find((i) => i.id === insightsIdeaId) ?? null;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const handleAutoplayBlocked = useCallback(() => {
    setIsMuted(true);
    showToast("Tap Unmute to play music");
  }, [showToast]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const loadIdeas = useCallback(async (mode: "replace" | "append" = "replace") => {
    try {
      if (mode === "replace") {
        setIsLoading(true);
        cursorRef.current = 0;
      } else {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
      }
      setError(null);

      const params = new URLSearchParams({
        scope: "feed",
        limit: "30",
        offset: String(mode === "append" ? cursorRef.current : 0),
      });

      const response = await fetch(`/api/ideas?${params.toString()}`);
      const payload = (await response.json()) as {
        ok: boolean;
        ideas?: FeedIdea[];
        nextOffset?: number | null;
        hasMore?: boolean;
        message?: string;
      };
      if (!response.ok || !payload.ok || !payload.ideas) {
        setError(payload.message ?? "Failed to load ideas");
        return;
      }

      cursorRef.current =
        typeof payload.nextOffset === "number"
          ? payload.nextOffset
          : cursorRef.current + payload.ideas.length;
      setHasMore(Boolean(payload.hasMore));

      setIdeas((prev) => {
        if (mode === "replace") return payload.ideas as FeedIdea[];
        const seen = new Set(prev.map((idea) => idea.id));
        const merged = [...prev];
        for (const idea of payload.ideas as FeedIdea[]) {
          if (!seen.has(idea.id)) merged.push(idea);
        }
        return merged;
      });
    } catch {
      setError("Failed to load ideas");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore]);

  useEffect(() => {
    void loadIdeas("replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deep-link: scroll to ?idea=<uuid> once loaded (fetch more pages if needed)
  useEffect(() => {
    if (!deepLinkIdeaId || !UUID_RE.test(deepLinkIdeaId) || deepLinkHandled.current) {
      return;
    }
    if (isLoading) return;

    const found = ideas.some((idea) => idea.id === deepLinkIdeaId);
    if (found) {
      deepLinkHandled.current = true;
      requestAnimationFrame(() => {
        const el = scrollRef.current?.querySelector<HTMLElement>(
          `[data-reel-idea-id="${deepLinkIdeaId}"]`,
        );
        el?.scrollIntoView({ block: "start", behavior: "smooth" });
      });
      return;
    }

    if (hasMore && !isLoadingMore) {
      void loadIdeas("append");
    } else if (!hasMore) {
      deepLinkHandled.current = true;
      showToast("Shared idea not found in feed");
    }
  }, [
    deepLinkIdeaId,
    ideas,
    isLoading,
    hasMore,
    isLoadingMore,
    loadIdeas,
    showToast,
  ]);

  const requireAuth = useCallback(() => {
    void signIn("google", { callbackUrl: "/dashboard" });
  }, []);

  const toggleLike = useCallback(
    async (ideaId: string) => {
      if (!isAuthed) {
        requireAuth();
        return;
      }
      if (likeInFlightRef.current.has(ideaId)) return;
      likeInFlightRef.current.add(ideaId);
      try {
        const response = await fetch(`/api/ideas/${ideaId}/like`, {
          method: "POST",
        });
        const payload = (await response.json()) as {
          ok: boolean;
          isLiked?: boolean;
          likeCount?: number;
          message?: string;
        };
        if (!response.ok || !payload.ok) {
          setError(payload.message ?? "Failed to update like");
          return;
        }
        setIdeas((prev) =>
          prev.map((idea) =>
            idea.id === ideaId
              ? {
                  ...idea,
                  isLiked: Boolean(payload.isLiked),
                  likeCount: payload.likeCount ?? idea.likeCount,
                }
              : idea,
          ),
        );
      } catch {
        setError("Failed to update like");
      } finally {
        likeInFlightRef.current.delete(ideaId);
      }
    },
    [isAuthed, requireAuth],
  );

  const openInsights = useCallback(
    (ideaId: string) => {
      if (!isAuthed) {
        requireAuth();
        return;
      }
      setInsightsIdeaId(ideaId);
    },
    [isAuthed, requireAuth],
  );

  const handleShare = useCallback(
    async (idea: FeedIdea) => {
      const result = await shareIdea({
        id: idea.id,
        title: idea.title,
        idea: idea.idea,
        authorName: idea.authorName,
      });
      if (result.ok && result.mode === "clipboard") {
        showToast("Link copied to clipboard");
      } else if (!result.ok && result.mode === "error") {
        showToast("Couldn't share — try copying the URL manually");
      }
    },
    [showToast],
  );

  return (
    <main className="h-screen overflow-hidden bg-black [&_button]:cursor-pointer">
      <div className="relative flex h-full flex-col">
        <div
          ref={scrollRef}
          className="hide-scrollbar flex-1 snap-y snap-mandatory overflow-y-auto"
        >
          {visibleIdeas.length === 0 && !isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-white/60">
                {error ??
                  (showTrendingOnly
                    ? "No hot ideas right now."
                    : "No ideas yet — be the first!")}
              </p>
              <Link
                href="/"
                className="text-sm text-[#3BF09A] underline underline-offset-4"
              >
                Back to home
              </Link>
            </div>
          ) : (
            <>
              {visibleIdeas.map((reel) => (
                <div
                  key={reel.id}
                  data-reel-idea-id={reel.id}
                  className="h-full w-full shrink-0"
                >
                  <div
                    className="relative flex h-full w-full snap-start snap-always flex-col justify-center px-6 pr-16 sm:px-10 sm:pr-20"
                    style={{ backgroundColor: reel.color }}
                  >
                    {reel.music && (
                      <ReelAudio
                        src={reel.music}
                        active={activeReelId === reel.id}
                        muted={isMuted}
                        onAutoplayBlocked={handleAutoplayBlocked}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => setIsMuted((prev) => !prev)}
                      disabled={!reel.music}
                      className="absolute left-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur-sm transition-colors hover:bg-black/45 disabled:cursor-not-allowed disabled:opacity-60 sm:left-5 sm:top-5"
                    >
                      {!reel.music || isMuted ? (
                        <VolumeX className="size-3.5" />
                      ) : (
                        <Volume2 className="size-3.5" />
                      )}
                      {!reel.music ? "No music" : isMuted ? "Unmute" : "Mute"}
                    </button>
                    {reel.trending && (
                      <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#F472B6]/15 px-3 py-1 text-xs font-semibold text-[#F472B6] backdrop-blur-sm sm:right-5 sm:top-5">
                        <Flame className="size-3.5" />
                        Hot
                      </span>
                    )}
                    <div className="flex w-full max-w-2xl flex-col gap-5">
                      <span className="dash-mono-tag w-fit text-[#3BF09A]">
                        {reel.category}
                      </span>
                      <h2 className="dash-serif text-4xl font-normal leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl">
                        {reel.title}
                      </h2>
                      <p className="text-base leading-relaxed text-white/70 sm:text-lg md:text-xl">
                        {reel.idea}
                      </p>
                      <div className="mt-1 flex items-center gap-2.5">
                        {reel.authorImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={reel.authorImage}
                            alt={reel.authorName}
                            referrerPolicy="no-referrer"
                            className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-white/25"
                          />
                        ) : (
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
                            {reel.authorName.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <span className="text-sm font-medium text-white/85">
                          {reel.authorName}
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-28 right-5 flex flex-col items-center gap-6 sm:right-6 sm:gap-7">
                      <button
                        type="button"
                        onClick={() => toggleLike(reel.id)}
                        className="flex flex-col items-center gap-1.5 transition-colors hover:text-[#F472B6]"
                      >
                        <Heart
                          className={`size-7 sm:size-8 ${
                            reel.isLiked
                              ? "fill-[#F472B6] text-[#F472B6]"
                              : "text-white"
                          }`}
                        />
                        <span className="text-xs text-white/60">
                          {reel.likeCount}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={
                          isAuthed
                            ? () => {
                                window.location.href = "/dashboard";
                              }
                            : requireAuth
                        }
                        className="flex flex-col items-center gap-1.5 transition-colors hover:text-[#60A5FA]"
                        title={
                          isAuthed
                            ? "Open dashboard to comment"
                            : "Login to comment"
                        }
                      >
                        <MessageCircle className="size-7 text-white sm:size-8" />
                        <span className="text-xs text-white/60">
                          {reel.commentCount}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShare(reel)}
                        className="flex flex-col items-center gap-1.5 transition-colors hover:text-[#3BF09A]"
                      >
                        <Share2 className="size-7 text-white sm:size-8" />
                        <span className="text-xs text-white/60">Share</span>
                      </button>
                    </div>

                    <div className="absolute bottom-20 left-6 flex gap-3 sm:left-10">
                      <button
                        type="button"
                        onClick={() => setSelectedIdeaId(reel.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-[#60A5FA]/40 hover:text-[#60A5FA]"
                      >
                        <FileText className="size-3.5" />
                        Info
                      </button>
                      <button
                        type="button"
                        onClick={() => openInsights(reel.id)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-[#3BF09A]/40 hover:text-[#3BF09A]"
                      >
                        <Sparkles className="size-3.5" />
                        AI
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {hasMore && (
                <div className="flex h-32 shrink-0 items-center justify-center">
                  <button
                    type="button"
                    onClick={() => void loadIdeas("append")}
                    disabled={isLoadingMore}
                    className="rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm text-white/80 transition-colors hover:bg-white/15 disabled:opacity-50"
                  >
                    {isLoadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {!isAuthed && status !== "loading" && (
          <button
            type="button"
            onClick={requireAuth}
            className="dash-pill-primary absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
          >
            <LogIn className="size-4" />
            Login to interact
          </button>
        )}
      </div>

      {selectedIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedIdeaId(null)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close info"
            >
              <X className="size-5" />
            </button>
            <p className="text-sm leading-relaxed text-white/80">
              {selectedIdea.description?.trim()
                ? selectedIdea.description
                : "No description was provided for this idea yet."}
            </p>
          </div>
        </div>
      )}

      <AiInsightsModal
        ideaId={insightsIdeaId}
        title={insightsIdea?.title}
        onClose={() => setInsightsIdeaId(null)}
      />

      {(isLoading || error || toast) && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-40 rounded-lg border border-white/10 bg-[#161616]/95 px-4 py-2 text-xs text-white/85 shadow-lg">
          {toast ?? (isLoading ? "Loading ideas..." : error)}
        </div>
      )}
    </main>
  );
}

export default function ReelPage() {
  return (
    <Suspense
      fallback={
        <main className="h-screen overflow-hidden bg-[#0D0D0D]">
          <div className="flex h-full items-center justify-center text-sm text-white/70">
            Loading reel...
          </div>
        </main>
      }
    >
      <ReelPageContent />
    </Suspense>
  );
}
