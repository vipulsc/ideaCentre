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
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
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
  trending: boolean;
  music?: string | null;
};

function ReelPageContent() {
  const { status } = useSession();
  const searchParams = useSearchParams();
  const isAuthed = status === "authenticated";
  const [ideas, setIdeas] = useState<FeedIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showTrendingOnly = searchParams.get("feed") === "trending";

  const visibleIdeas = showTrendingOnly
    ? ideas.filter((idea) => idea.trending)
    : ideas;

  const selectedIdea =
    visibleIdeas.find((i) => i.id === selectedIdeaId) ?? null;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const loadIdeas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/ideas");
      const payload = (await response.json()) as {
        ok: boolean;
        ideas?: FeedIdea[];
        message?: string;
      };
      if (!response.ok || !payload.ok || !payload.ideas) {
        setError(payload.message ?? "Failed to load ideas");
        return;
      }
      setIdeas(payload.ideas);
    } catch {
      setError("Failed to load ideas");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadIdeas();
  }, [loadIdeas]);

  const requireAuth = useCallback(() => {
    void signIn("google", { callbackUrl: "/dashboard" });
  }, []);

  const toggleLike = useCallback(
    async (ideaId: string) => {
      if (!isAuthed) {
        requireAuth();
        return;
      }
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
      }
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
    <main className="h-screen overflow-hidden bg-[#0D0D0D] [&_button]:cursor-pointer">
      <div className="relative flex h-full flex-col">
        <div className="hide-scrollbar flex-1 snap-y snap-mandatory overflow-y-auto">
          {visibleIdeas.length === 0 && !isLoading ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-white/60">
                {error ??
                  (showTrendingOnly
                    ? "No trending ideas right now."
                    : "No ideas yet — be the first!")}
              </p>
              <Link
                href="/"
                className="text-sm text-[#00FF85] underline underline-offset-4"
              >
                Back to home
              </Link>
            </div>
          ) : (
            visibleIdeas.map((reel) => (
              <div key={reel.id} className="h-full w-full shrink-0">
                <div
                  className="relative flex h-full w-full snap-start snap-always flex-col justify-center px-6 pr-16 sm:px-10 sm:pr-20"
                  style={{ backgroundColor: reel.color }}
                >
                  {reel.music && (
                    <audio
                      src={reel.music}
                      autoPlay
                      loop
                      muted={isMuted}
                      playsInline
                      preload="metadata"
                      className="hidden"
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
                    <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#FF0099]/15 px-3 py-1 text-xs font-semibold text-[#FF0099] backdrop-blur-sm sm:right-5 sm:top-5">
                      <Flame className="size-3.5" />
                      Trending
                    </span>
                  )}
                  <div className="flex w-full max-w-2xl flex-col gap-6">
                    <span className="w-fit rounded-full bg-[#00FF85]/15 px-4 py-1 text-xs font-medium text-[#00FF85] sm:text-sm">
                      {reel.category}
                    </span>
                    <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                      {reel.title}
                    </h2>
                    <p className="text-base leading-relaxed text-white/70 sm:text-lg md:text-xl">
                      {reel.idea}
                    </p>
                    <p className="text-sm text-white/35">by {reel.authorName}</p>
                  </div>

                  <div className="absolute bottom-28 right-5 flex flex-col items-center gap-6 sm:right-6 sm:gap-7">
                    <button
                      type="button"
                      onClick={() => toggleLike(reel.id)}
                      className="flex flex-col items-center gap-1.5 transition-colors hover:text-[#FF0099]"
                    >
                      <Heart
                        className={`size-7 sm:size-8 ${reel.isLiked ? "fill-[#FF0099] text-[#FF0099]" : "text-white"}`}
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
                      className="flex flex-col items-center gap-1.5 transition-colors hover:text-[#1E90FF]"
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
                      className="flex flex-col items-center gap-1.5 transition-colors hover:text-[#00FF85]"
                    >
                      <Share2 className="size-7 text-white sm:size-8" />
                      <span className="text-xs text-white/60">Share</span>
                    </button>
                  </div>

                  <div className="absolute bottom-20 left-6 flex gap-3 sm:left-10">
                    <button
                      type="button"
                      onClick={() => setSelectedIdeaId(reel.id)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-[#1E90FF]/40 hover:text-[#1E90FF]"
                    >
                      <FileText className="size-3.5" />
                      Info
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-[#00FF85]/40 hover:text-[#00FF85]"
                    >
                      <Sparkles className="size-3.5" />
                      AI
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {!isAuthed && (
          <button
            type="button"
            onClick={requireAuth}
            className="absolute right-4 top-4 z-20 inline-flex items-center gap-2 rounded-full bg-[#00FF85] px-4 py-2 text-sm font-semibold text-[#0D0D0D] shadow-lg transition-colors hover:bg-[#00FF85]/85"
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
