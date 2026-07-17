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
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AiInsightsModal } from "@/components/ai-insights-modal";
import { ReelAudio } from "@/components/reel-audio";
import { useActiveReelId } from "@/hooks/use-active-reel-id";
import { currentInternalPath, signInWithGoogle } from "@/lib/auth-client";
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

const CATEGORY_ACCENTS: Record<string, string> = {
  "AI / Health": "#5eead4",
  Community: "#f0abfc",
  SaaS: "#93c5fd",
  Education: "#fcd34d",
  Finance: "#86efac",
  Sustainability: "#a3e635",
  Entertainment: "#fda4af",
  Other: "#d4d4d8",
};

function categoryAccent(category: string) {
  return CATEGORY_ACCENTS[category] ?? "#c7c7cc";
}

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

  // Server returns the Hot feed ranked globally; no client-side filter.
  const visibleIdeas = ideas;

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
        scope: showTrendingOnly ? "trending" : "feed",
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
  }, [hasMore, isLoadingMore, showTrendingOnly]);

  useEffect(() => {
    void loadIdeas("replace");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTrendingOnly]);

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
    void signInWithGoogle(currentInternalPath("/reel"));
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
                    className="relative flex h-full w-full snap-start snap-always flex-col justify-end overflow-hidden text-white"
                    style={{
                      background: `linear-gradient(180deg, ${reel.color}ee 0%, ${reel.color} 45%, #000000 100%)`,
                    }}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.14),transparent_55%)]"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full blur-[120px]"
                      style={{
                        backgroundColor: categoryAccent(reel.category),
                        opacity: 0.22,
                      }}
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/90 via-black/40 to-transparent"
                    />

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
                      className="dash-icon-btn absolute left-4 top-4 z-20 h-9 gap-1.5 px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 sm:left-5 sm:top-5"
                    >
                      {!reel.music || isMuted ? (
                        <VolumeX className="size-3.5" />
                      ) : (
                        <Volume2 className="size-3.5" />
                      )}
                      {!reel.music ? "No music" : isMuted ? "Unmute" : "Mute"}
                    </button>

                    {reel.trending && (
                      <span className="absolute left-4 top-[4.25rem] z-20 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-xl sm:left-5 sm:top-[4.75rem]">
                        <Flame className="size-3.5 text-[#f472b6]" />
                        Hot
                      </span>
                    )}

                    <div className="relative z-10 flex w-full max-w-2xl flex-col gap-4 px-6 pb-32 pr-20 sm:px-10 sm:pr-24">
                      <div className="flex items-center gap-2.5">
                        {reel.authorImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={reel.authorImage}
                            alt={reel.authorName}
                            referrerPolicy="no-referrer"
                            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white/25"
                          />
                        ) : (
                          <span
                            className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-[#241812]"
                            style={{
                              backgroundColor: categoryAccent(reel.category),
                            }}
                          >
                            {reel.authorName.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold tracking-tight">
                            {reel.authorName}
                          </p>
                          <p
                            className="dash-mono-tag"
                            style={{ color: categoryAccent(reel.category) }}
                          >
                            {reel.category}
                          </p>
                        </div>
                      </div>
                      <h2 className="dash-serif text-4xl font-normal leading-[1.08] tracking-tight text-white sm:text-5xl md:text-[3.25rem]">
                        {reel.title}
                      </h2>
                      <p className="max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
                        {reel.idea}
                      </p>
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setSelectedIdeaId(reel.id)}
                          className="dash-icon-btn h-8 gap-1.5 px-3.5 text-[11px] font-medium"
                        >
                          <FileText className="size-3.5" />
                          Info
                        </button>
                        <button
                          type="button"
                          onClick={() => openInsights(reel.id)}
                          className="dash-icon-btn h-8 gap-1.5 px-3.5 text-[11px] font-medium"
                        >
                          <Sparkles className="size-3.5" />
                          AI
                        </button>
                      </div>
                    </div>

                    <div className="absolute bottom-28 right-4 z-10 flex flex-col items-center gap-5 sm:right-6 sm:bottom-32 sm:gap-6">
                      <button
                        type="button"
                        onClick={() => toggleLike(reel.id)}
                        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                      >
                        <span className="dash-icon-btn h-11 w-11">
                          <Heart
                            className={`size-6 ${
                              reel.isLiked
                                ? "fill-[#f472b6] text-[#f472b6]"
                                : "text-white"
                            }`}
                          />
                        </span>
                        <span className="text-[11px] font-medium tabular-nums text-white/80">
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
                        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                        title={
                          isAuthed
                            ? "Open dashboard to comment"
                            : "Login to comment"
                        }
                      >
                        <span className="dash-icon-btn h-11 w-11">
                          <MessageCircle className="size-6 text-white" />
                        </span>
                        <span className="text-[11px] font-medium tabular-nums text-white/80">
                          {reel.commentCount}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleShare(reel)}
                        className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                      >
                        <span className="dash-icon-btn h-11 w-11">
                          <Share2 className="size-5.5 text-white" />
                        </span>
                        <span className="text-[11px] font-medium text-white/80">
                          Share
                        </span>
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
            className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-[#3BF09A] bg-transparent px-4 py-2 text-sm font-bold text-[#3BF09A] backdrop-blur-sm transition-colors duration-200 hover:bg-[#3BF09A]/10"
          >
            <LogIn className="size-4" />
            Login to interact
          </button>
        )}
      </div>

      {selectedIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="relative w-full max-w-xl rounded-[24px] border border-[#faf0dc]/16 bg-[#1c130d]/85 p-6 shadow-[0_16px_48px_rgba(12,8,5,0.5)] backdrop-blur-2xl">
            <button
              type="button"
              onClick={() => setSelectedIdeaId(null)}
              className="dash-icon-btn absolute right-3 top-3 h-8 w-8"
              aria-label="Close info"
            >
              <X className="size-4" />
            </button>
            <p className="pr-8 text-[11px] font-medium uppercase tracking-[0.16em] text-white/40">
              Details
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/80">
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
