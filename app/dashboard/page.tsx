"use client";

import {
  ArrowLeft,
  BarChart3,
  Bookmark,
  ChevronRight,
  FileText,
  Flame,
  Grid,
  Heart,
  LogOut,
  MessageCircle,
  Play,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import NewIdeaModal from "@/components/new-idea-modal";
import { AiInsightsModal } from "@/components/ai-insights-modal";
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
  isBookmarked: boolean;
  authorName: string;
  authorEmail: string | null;
  trending: boolean;
  createdAt?: string | null;
  hotScore?: number;
  trendingRank?: number;
  trendingPercentile?: number;
  hotBreakdown?: {
    engagement: number;
    engScore: number;
    velocity: number;
    velBoost: number;
    freshness: number;
    decay: number;
    ageHours: number;
  };
};

type FeedComment = {
  id: string;
  body: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  authorName: string;
  authorEmail: string | null;
  authorImage: string | null;
  isOwn: boolean;
};

function ReelCard({
  id,
  title,
  idea,
  author,
  color,
  tag,
  trending,
  likeCount,
  commentCount,
  isLiked,
  isBookmarked,
  onLike,
  onInfo,
  onComment,
  onShare,
  onBookmark,
  onInsights,
}: {
  id: string;
  title: string;
  idea: string;
  author: string;
  color: string;
  tag: string;
  trending?: boolean;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: (ideaId: string) => void;
  onInfo: (ideaId: string) => void;
  onComment: (ideaId: string) => void;
  onShare: (ideaId: string) => void;
  onBookmark: (ideaId: string) => void;
  onInsights: (ideaId: string) => void;
}) {
  return (
    <div
      className="relative flex h-full w-full snap-start snap-always flex-col justify-center px-6 pr-16 sm:px-10 sm:pr-20"
      style={{ backgroundColor: color }}
    >
      {trending && (
        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-[#FF0099]/15 px-3 py-1 text-xs font-semibold text-[#FF0099] backdrop-blur-sm sm:right-5 sm:top-5">
          <Flame className="size-3.5" />
          Trending
        </span>
      )}
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <span className="w-fit rounded-full bg-[#00FF85]/15 px-4 py-1 text-xs font-medium text-[#00FF85] sm:text-sm">
          {tag}
        </span>
        <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
          {title}
        </h2>
        <p className="text-base leading-relaxed text-white/70 sm:text-lg md:text-xl">
          {idea}
        </p>
        <p className="text-sm text-white/35">by {author}</p>
      </div>

      <div className="absolute bottom-28 right-5 flex flex-col items-center gap-6 sm:right-6 sm:gap-7">
        <button
          type="button"
          onClick={() => onLike(id)}
          className="flex flex-col items-center gap-1.5 transition-colors hover:text-[#FF0099]"
        >
          <Heart
            className={`size-7 sm:size-8 ${isLiked ? "fill-[#FF0099] text-[#FF0099]" : "text-white"}`}
          />
          <span className="text-xs text-white/60">{likeCount}</span>
        </button>
        <button
          type="button"
          onClick={() => onComment(id)}
          className="flex flex-col items-center gap-1.5 transition-colors hover:text-[#1E90FF]"
        >
          <MessageCircle className="size-7 text-white sm:size-8" />
          <span className="text-xs text-white/60">{commentCount}</span>
        </button>
        <button
          type="button"
          onClick={() => onShare(id)}
          className="flex flex-col items-center gap-1.5 transition-colors hover:text-[#00FF85]"
        >
          <Share2 className="size-7 text-white sm:size-8" />
          <span className="text-xs text-white/60">Share</span>
        </button>
        <button
          type="button"
          onClick={() => onBookmark(id)}
          className="flex flex-col items-center gap-1.5 transition-colors hover:text-[#FFD54A]"
        >
          <Bookmark
            className={`size-7 sm:size-8 ${isBookmarked ? "fill-[#FFD54A] text-[#FFD54A]" : "text-white"}`}
          />
          <span className="text-xs text-white/60">Save</span>
        </button>
      </div>

      <div className="absolute bottom-20 left-6 flex gap-3 sm:left-10">
        <button
          type="button"
          onClick={() => onInfo(id)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-[#1E90FF]/40 hover:text-[#1E90FF]"
        >
          <FileText className="size-3.5" />
          Info
        </button>
        <button
          type="button"
          onClick={() => onInsights(id)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-white/40 hover:text-white"
        >
          <Sparkles className="size-3.5" />
          AI
        </button>
      </div>
    </div>
  );
}

function IdeaCard({
  id,
  title,
  idea,
  author,
  color,
  tag,
  trending,
  likeCount,
  commentCount,
  isLiked,
  isBookmarked,
  onLike,
  onInfo,
  onComment,
  onShare,
  onBookmark,
  onInsights,
}: {
  id: string;
  title: string;
  idea: string;
  author: string;
  color: string;
  tag: string;
  trending?: boolean;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  onLike: (ideaId: string) => void;
  onInfo: (ideaId: string) => void;
  onComment: (ideaId: string) => void;
  onShare: (ideaId: string) => void;
  onBookmark: (ideaId: string) => void;
  onInsights: (ideaId: string) => void;
}) {
  return (
    <div
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/15 p-5 ring-1 ring-inset ring-white/8 transition-all duration-300 hover:border-[#00FF85]/45 hover:ring-[#00FF85]/25"
      style={{ backgroundColor: color }}
    >
      {trending && (
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#FF0099]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#FF0099]">
          <Flame className="size-3" />
          Trending
        </span>
      )}
      <div className="flex flex-col gap-3">
        <span className="w-fit rounded-full bg-[#00FF85]/15 px-3 py-0.5 text-[11px] font-medium text-[#00FF85]">
          {tag}
        </span>
        <p className="text-lg font-bold text-white">{title}</p>
        <p className="text-sm leading-relaxed text-white">{idea}</p>
        <p className="text-xs text-white">by {author}</p>
      </div>
      <div className="mt-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onInfo(id)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[11px] font-semibold text-white/85 transition-colors hover:border-[#1E90FF]/50 hover:text-[#1E90FF]"
        >
          <FileText className="size-3.5" />
          <span>Info</span>
        </button>
        <button
          type="button"
          onClick={() => onInsights(id)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[11px] font-semibold text-white/85 transition-colors hover:border-white/40 hover:text-white"
        >
          <Sparkles className="size-3.5" />
          <span>AI</span>
        </button>
      </div>
      <div className="mt-4 flex items-center gap-4 border-t border-white/8 pt-4 text-white">
        <button
          type="button"
          onClick={() => onLike(id)}
          className="flex items-center gap-1.5 transition-colors hover:text-[#FF0099]"
        >
          <Heart
            className={`size-4 ${isLiked ? "fill-[#FF0099] text-[#FF0099]" : ""}`}
          />
          <span className="text-xs">{likeCount}</span>
        </button>
        <button
          type="button"
          onClick={() => onComment(id)}
          className="flex items-center gap-1.5 transition-colors hover:text-[#1E90FF]"
        >
          <MessageCircle className="size-4" />
          <span className="text-xs">{commentCount}</span>
        </button>
        <button
          type="button"
          onClick={() => onShare(id)}
          className="flex items-center gap-1.5 transition-colors hover:text-[#00FF85]"
        >
          <Share2 className="size-4" />
          <span className="text-xs">Share</span>
        </button>
        <button
          type="button"
          onClick={() => onBookmark(id)}
          className="flex items-center gap-1.5 transition-colors hover:text-[#FFD54A]"
        >
          <Bookmark
            className={`size-4 ${isBookmarked ? "fill-[#FFD54A] text-[#FFD54A]" : ""}`}
          />
          <span className="text-xs">Save</span>
        </button>
      </div>
    </div>
  );
}

function formatRelativeTime(iso?: string | null) {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diff = Date.now() - then;
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < minute) return "just now";
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function PerformanceRing({
  value,
  color,
}: {
  value: number;
  color: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  const data = [{ name: "score", value: clamped, fill: color }];
  return (
    <div className="relative h-20 w-20 shrink-0 sm:h-24 sm:w-24">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="72%"
          outerRadius="100%"
          data={data}
          startAngle={90}
          endAngle={90 - 360 * (clamped / 100)}
          barSize={8}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            tick={false}
            axisLine={false}
          />
          <RadialBar
            background={{ fill: "rgba(255,255,255,0.06)" }}
            dataKey="value"
            cornerRadius={8}
            fill={color}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-lg font-bold sm:text-xl"
          style={{ color }}
        >
          {Math.round(clamped)}
        </span>
        <span className="text-[9px] font-medium uppercase tracking-wider text-white/40">
          score
        </span>
      </div>
    </div>
  );
}

function IdeaAnalyticsCard({
  idea,
  rank,
  totalIdeas,
  maxHotScore,
}: {
  idea: FeedIdea;
  rank: number;
  totalIdeas: number;
  maxHotScore: number;
}) {
  const engagement = idea.likeCount + idea.commentCount;
  const hotScore = idea.hotScore ?? 0;
  const score =
    maxHotScore > 0 ? Math.round((hotScore / maxHotScore) * 100) : 0;

  const isTop = rank === 1 && engagement > 0;
  const ringColor = isTop ? "#00FF85" : rank === 2 ? "#FFD54A" : "#1E90FF";

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all ${
        isTop
          ? "border-[#00FF85]/30 bg-linear-to-br from-[#00FF85]/[0.07] via-[#0D0D0D] to-[#0D0D0D]"
          : "border-white/8 bg-[#0D0D0D] hover:border-white/15"
      }`}
    >
      {isTop && (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#00FF85]/10 blur-3xl"
        />
      )}

      <header className="relative mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-wider">
            <span className="rounded-full bg-white/6 px-2.5 py-0.5 text-white/70">
              {idea.category}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${
                isTop
                  ? "bg-[#00FF85]/15 text-[#00FF85]"
                  : "bg-white/6 text-white/50"
              }`}
            >
              #{rank}
              <span className="text-white/30">/ {totalIdeas}</span>
            </span>
            {idea.trending && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-[#FF0099]/15 px-2 py-0.5 text-[#FF0099]"
                title="Trending — high engagement adjusted for recency"
              >
                <Flame className="size-3" />
                Hot
              </span>
            )}
          </div>
          <h4 className="line-clamp-2 text-base font-bold leading-snug text-white">
            {idea.title}
          </h4>
          <p className="text-[11px] text-white/40">
            Posted {formatRelativeTime(idea.createdAt)}
          </p>
        </div>
        <PerformanceRing value={score} color={ringColor} />
      </header>

      <div className="grid grid-cols-2 gap-2">
        <StatPill
          icon={<Heart className="size-3.5 fill-[#FF0099] text-[#FF0099]" />}
          label="Likes"
          value={idea.likeCount}
          color="#FF0099"
        />
        <StatPill
          icon={<MessageCircle className="size-3.5 text-[#1E90FF]" />}
          label="Comments"
          value={idea.commentCount}
          color="#1E90FF"
        />
      </div>
    </article>
  );
}

function StatPill({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="rounded-xl border border-white/6 bg-white/3 px-3 py-2.5"
      style={{ boxShadow: `inset 0 0 0 1px ${color}10` }}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
        {icon}
        {label}
      </div>
      <p className="mt-0.5 text-xl font-bold tabular-nums" style={{ color }}>
        {value}
      </p>
    </div>
  );
}


export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name?.trim() || "You";
  const userEmail = session?.user?.email ?? null;
  const profileImage = session?.user?.image;
  const [reelMode, setReelMode] = useState(false);
  const [activeFeed, setActiveFeed] = useState<"trending" | "saved">("trending");
  const [profileMenu, setProfileMenu] = useState(false);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [reelFocusIdeaId, setReelFocusIdeaId] = useState<string | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [analyticsIdeaId, setAnalyticsIdeaId] = useState<string | null>(null);
  const [insightsIdeaId, setInsightsIdeaId] = useState<string | null>(null);
  const [commentsIdeaId, setCommentsIdeaId] = useState<string | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentDraft, setCommentDraft] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [ideas, setIdeas] = useState<FeedIdea[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true);
  const [ideasError, setIdeasError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const reelScrollRef = useRef<HTMLDivElement>(null);

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

  const closeMenu = useCallback(() => setProfileMenu(false), []);
  const myIdeas = ideas.filter((item) => item.authorEmail === userEmail);
  const savedIdeas = ideas.filter((item) => item.isBookmarked);
  const displayedIdeas = activeFeed === "saved" ? savedIdeas : ideas;
  const selectedIdea = ideas.find((item) => item.id === selectedIdeaId) ?? null;
  const commentsIdea =
    ideas.find((item) => item.id === commentsIdeaId) ?? null;
  const analyticsIdea =
    ideas.find((item) => item.id === analyticsIdeaId) ?? null;
  const insightsIdea =
    ideas.find((item) => item.id === insightsIdeaId) ?? null;
  const analyticsRank = analyticsIdea
    ? [...myIdeas]
        .sort(
          (a, b) =>
            b.likeCount + b.commentCount - (a.likeCount + a.commentCount),
        )
        .findIndex((i) => i.id === analyticsIdea.id) + 1
    : 0;
  const analyticsMaxHotScore = Math.max(
    ...myIdeas.map((i) => i.hotScore ?? 0),
    0,
  );

  const loadIdeas = useCallback(async () => {
    try {
      setIsLoadingIdeas(true);
      setIdeasError(null);
      const response = await fetch("/api/ideas");
      const payload = (await response.json()) as {
        ok: boolean;
        ideas?: FeedIdea[];
        message?: string;
      };

      if (!response.ok || !payload.ok || !payload.ideas) {
        setIdeasError(payload.message ?? "Failed to load ideas");
        return;
      }

      setIdeas(payload.ideas);
    } catch {
      setIdeasError("Failed to load ideas");
    } finally {
      setIsLoadingIdeas(false);
    }
  }, []);

  useEffect(() => {
    void loadIdeas();
  }, [loadIdeas]);

  const openComments = useCallback(async (ideaId: string) => {
    setCommentsIdeaId(ideaId);
    setCommentDraft("");
    setComments([]);
    setIsLoadingComments(true);
    try {
      const response = await fetch(`/api/ideas/${ideaId}/comments`);
      const payload = (await response.json()) as {
        ok: boolean;
        comments?: FeedComment[];
        message?: string;
      };
      if (!response.ok || !payload.ok || !payload.comments) {
        setIdeasError(payload.message ?? "Failed to load comments");
        return;
      }
      setComments(payload.comments);
    } catch {
      setIdeasError("Failed to load comments");
    } finally {
      setIsLoadingComments(false);
    }
  }, []);

  const closeComments = useCallback(() => {
    setCommentsIdeaId(null);
    setComments([]);
    setCommentDraft("");
  }, []);

  const postComment = useCallback(async () => {
    if (!commentsIdeaId) return;
    const text = commentDraft.trim();
    if (!text) return;
    setIsPostingComment(true);
    try {
      const response = await fetch(`/api/ideas/${commentsIdeaId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const payload = (await response.json()) as {
        ok: boolean;
        comment?: FeedComment;
        commentCount?: number;
        message?: string;
      };
      if (!response.ok || !payload.ok || !payload.comment) {
        setIdeasError(payload.message ?? "Failed to post comment");
        return;
      }
      setComments((prev) => [...prev, payload.comment as FeedComment]);
      setCommentDraft("");
      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === commentsIdeaId
            ? {
                ...idea,
                commentCount: payload.commentCount ?? idea.commentCount + 1,
              }
            : idea,
        ),
      );
    } catch {
      setIdeasError("Failed to post comment");
    } finally {
      setIsPostingComment(false);
    }
  }, [commentDraft, commentsIdeaId]);

  const toggleCommentLike = useCallback(async (commentId: string) => {
    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      });
      const payload = (await response.json()) as {
        ok: boolean;
        isLiked?: boolean;
        likeCount?: number;
        message?: string;
      };
      if (!response.ok || !payload.ok) {
        setIdeasError(payload.message ?? "Failed to update like");
        return;
      }
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId
            ? {
                ...c,
                isLiked: Boolean(payload.isLiked),
                likeCount: payload.likeCount ?? c.likeCount,
              }
            : c,
        ),
      );
    } catch {
      setIdeasError("Failed to update like");
    }
  }, []);

  const deleteComment = useCallback(
    async (commentId: string) => {
      try {
        const response = await fetch(`/api/comments/${commentId}`, {
          method: "DELETE",
        });
        const payload = (await response.json()) as {
          ok: boolean;
          commentCount?: number;
          ideaId?: string;
          message?: string;
        };
        if (!response.ok || !payload.ok) {
          setIdeasError(payload.message ?? "Failed to delete comment");
          return;
        }
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        const targetIdeaId = payload.ideaId ?? commentsIdeaId;
        if (targetIdeaId) {
          setIdeas((prev) =>
            prev.map((idea) =>
              idea.id === targetIdeaId
                ? {
                    ...idea,
                    commentCount:
                      payload.commentCount ?? Math.max(idea.commentCount - 1, 0),
                  }
                : idea,
            ),
          );
        }
      } catch {
        setIdeasError("Failed to delete comment");
      }
    },
    [commentsIdeaId],
  );

  const handleShare = useCallback(
    async (ideaId: string) => {
      const target = ideas.find((item) => item.id === ideaId);
      if (!target) return;
      const result = await shareIdea({
        id: target.id,
        title: target.title,
        idea: target.idea,
        authorName: target.authorName,
      });
      if (result.ok && result.mode === "clipboard") {
        showToast("Link copied to clipboard");
      } else if (!result.ok && result.mode === "error") {
        showToast("Couldn't share — try copying the URL manually");
      }
    },
    [ideas, showToast],
  );

  const toggleLike = useCallback(async (ideaId: string) => {
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
        setIdeasError(payload.message ?? "Failed to update like");
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
      setIdeasError("Failed to update like");
    }
  }, []);

  const toggleBookmark = useCallback(async (ideaId: string) => {
    try {
      const response = await fetch(`/api/ideas/${ideaId}/bookmark`, {
        method: "POST",
      });
      const payload = (await response.json()) as {
        ok: boolean;
        isBookmarked?: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        setIdeasError(payload.message ?? "Failed to update bookmark");
        return;
      }

      setIdeas((prev) =>
        prev.map((idea) =>
          idea.id === ideaId
            ? { ...idea, isBookmarked: Boolean(payload.isBookmarked) }
            : idea,
        ),
      );
    } catch {
      setIdeasError("Failed to update bookmark");
    }
  }, []);

  useEffect(() => {
    if (!profileMenu) return;
    function onClickOutside(e: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        closeMenu();
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [profileMenu, closeMenu]);

  useEffect(() => {
    if (!reelMode || !reelFocusIdeaId || !reelScrollRef.current) return;
    const target = reelScrollRef.current.querySelector<HTMLElement>(
      `[data-reel-idea-id="${reelFocusIdeaId}"]`,
    );
    if (target) {
      target.scrollIntoView({ block: "start", behavior: "smooth" });
    }
    setReelFocusIdeaId(null);
  }, [reelMode, reelFocusIdeaId, ideas]);

  return (
    <main className="h-screen overflow-hidden bg-[#0D0D0D] [&_button]:cursor-pointer">
      {/* ─── REEL MODE (mobile always, desktop when toggled) ─── */}
      <div
        className={`relative flex h-full flex-col ${reelMode ? "" : "lg:hidden"}`}
      >
        <div
          ref={reelScrollRef}
          className="hide-scrollbar flex-1 snap-y snap-mandatory overflow-y-auto"
        >
          {displayedIdeas.length === 0 ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-white/60">
              {activeFeed === "saved"
                ? "No saved ideas yet. Tap Save on any card."
                : "No ideas found."}
            </div>
          ) : (
            displayedIdeas.map((reel) => (
              <div
                key={reel.id}
                data-reel-idea-id={reel.id}
                className="h-full w-full shrink-0"
              >
                <ReelCard
                  id={reel.id}
                  title={reel.title}
                  idea={reel.idea}
                  author={reel.authorName}
                  color={reel.color}
                  tag={reel.category}
                  trending={reel.trending}
                  likeCount={reel.likeCount}
                  commentCount={reel.commentCount}
                  isLiked={reel.isLiked}
                  isBookmarked={reel.isBookmarked}
                  onLike={toggleLike}
                  onInfo={setSelectedIdeaId}
                  onComment={openComments}
                  onShare={handleShare}
                  onBookmark={toggleBookmark}
                  onInsights={setInsightsIdeaId}
                />
              </div>
            ))
          )}
        </div>

        {reelMode && (
          <button
            type="button"
            onClick={() => setReelMode(false)}
            className="absolute left-4 top-4 z-20 hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-[#00FF85]/20 hover:text-[#00FF85] lg:inline-flex"
          >
            <Grid className="size-4" />
            Grid View
          </button>
        )}

        <nav className="absolute inset-x-0 bottom-0 z-10 border-t border-white/8 bg-[#0D0D0D]/80 px-6 py-3 backdrop-blur-md">
          <ul className="flex items-center justify-between">
            <li>
              <button
                type="button"
                onClick={() => setActiveFeed("trending")}
                className="inline-flex flex-col items-center gap-1 text-white/70 transition-colors hover:text-[#00FF85]"
              >
                <Flame className="size-6" />
                <span className="text-[11px] font-medium">Trending</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setShowNewIdea(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#00FF85] text-[#0D0D0D] transition-colors hover:bg-[#00FF85]/80"
                aria-label="Create"
              >
                <Plus className="size-5 stroke-[2.5]" />
              </button>
            </li>
            <li className="relative">
              <button
                type="button"
                onClick={() => setProfileMenu((v) => !v)}
                className="inline-flex flex-col items-center gap-1 text-white/70 transition-colors hover:text-[#1E90FF]"
              >
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileImage}
                    alt={userName}
                    className="h-6 w-6 rounded-full object-cover ring-2 ring-[#1E90FF]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E90FF] text-[10px] font-semibold text-white">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-[11px] font-medium">Profile</span>
              </button>

              {profileMenu && (
                <div
                  ref={profileRef}
                  className="absolute bottom-full right-0 z-20 mb-3 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#161616] py-1 shadow-lg shadow-black/50"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenu(false);
                      setShowProfile(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <User className="size-4" />
                    My Ideas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenu(false);
                      setActiveFeed("saved");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/8 hover:text-[#1E90FF]"
                  >
                    <Bookmark className="size-4" />
                    Saved
                  </button>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#FF0099] transition-colors hover:bg-white/8"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* ─── DESKTOP: sidebar + scrollable grid feed ─── */}
      <div className={`hidden h-full ${reelMode ? "" : "lg:flex"}`}>
        <aside className="flex w-56 shrink-0 flex-col border-r border-white/8 bg-[#111111] px-5 py-8 lg:w-64">
          <p className="mb-10 text-lg font-bold tracking-tight text-white">
            idea<span className="text-[#00FF85]">Centre</span>
          </p>
          <button
            type="button"
            onClick={() => setShowNewIdea(true)}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00FF85] px-4 py-2.5 text-sm font-semibold text-[#0D0D0D] transition-colors hover:bg-[#00FF85]/85"
          >
            <Plus className="size-4 stroke-[2.5]" />
            New Idea
          </button>

          <nav className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setActiveFeed("trending")}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                activeFeed === "trending"
                  ? "bg-[#00FF85]/10 font-medium text-[#00FF85]"
                  : "text-white/40 hover:bg-white/6 hover:text-white/80"
              }`}
            >
              <Flame className="size-5" />
              Trending
            </button>
            <button
              type="button"
              onClick={() => setActiveFeed("saved")}
              className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm transition-colors ${
                activeFeed === "saved"
                  ? "bg-[#1E90FF]/12 font-medium text-[#1E90FF]"
                  : "text-white/40 hover:bg-white/6 hover:text-white/80"
              }`}
            >
              <Bookmark className="size-5" />
              Saved
            </button>
            <button
              type="button"
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/6 hover:text-white/80"
            >
              <User className="size-5" />
              My Ideas
            </button>
          </nav>

          <div className="mt-auto">
            <div className="flex items-center gap-2.5">
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImage}
                  alt={userName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-[#1E90FF]/50"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E90FF] text-xs font-semibold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-medium text-white/70">
                {userName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#FF0099]/30 bg-[#FF0099]/10 px-4 py-2.5 text-sm font-medium text-[#FF0099] transition-colors hover:bg-[#FF0099]/20"
            >
              <LogOut className="size-4" />
              Logout
            </button>
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto bg-[#0D0D0D] px-8 py-8 lg:px-12">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">
              {activeFeed === "saved" ? "Saved Ideas" : "Discover Ideas"}
            </h1>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 pr-1 animate-reel-hint-in">
                <span
                  className="relative top-px hidden text-[18px] leading-none tracking-wide text-[#00FF85]/90 sm:inline-block"
                  style={{
                    fontFamily:
                      "var(--font-handwritten), 'Caveat', 'Bradley Hand', cursive",
                  }}
                >
                  feel the ideas, try
                </span>
                <span
                  aria-hidden="true"
                  className="hidden items-center text-[#00FF85] sm:inline-flex"
                >
                  <ChevronRight
                    className="-mr-2 size-5 animate-reel-chevron opacity-30 [animation-delay:0ms]"
                    strokeWidth={2.5}
                  />
                  <ChevronRight
                    className="-mr-2 size-5 animate-reel-chevron opacity-60 [animation-delay:150ms]"
                    strokeWidth={2.5}
                  />
                  <ChevronRight
                    className="size-5 animate-reel-chevron [animation-delay:300ms]"
                    strokeWidth={2.5}
                  />
                </span>
              </div>
              <button
                type="button"
                onClick={() => setReelMode(true)}
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#00FF85]/40 bg-[#00FF85]/10 px-5 py-2 text-sm font-medium text-[#00FF85] transition-all duration-300 hover:border-[#00FF85]/70 hover:bg-[#00FF85]/15 hover:shadow-[0_0_32px_-4px_rgba(0,255,133,0.55)] animate-reel-glow"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-[#00FF85]/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Play className="size-4 fill-[#00FF85]" />
                Reel Mode
              </button>
            </div>
          </div>
          {displayedIdeas.length === 0 ? (
            <div className="rounded-2xl border border-white/8 bg-[#111111] p-10 text-center text-white/60">
              {activeFeed === "saved"
                ? "No saved ideas yet. Use Save on any idea card."
                : "No ideas found."}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
              {displayedIdeas.map((reel) => (
                <IdeaCard
                  key={reel.id}
                  id={reel.id}
                  title={reel.title}
                  idea={reel.idea}
                  author={reel.authorName}
                  color={reel.color}
                  tag={reel.category}
                  trending={reel.trending}
                  likeCount={reel.likeCount}
                  commentCount={reel.commentCount}
                  isLiked={reel.isLiked}
                  isBookmarked={reel.isBookmarked}
                  onLike={toggleLike}
                  onInfo={setSelectedIdeaId}
                  onComment={openComments}
                  onShare={handleShare}
                  onBookmark={toggleBookmark}
                  onInsights={setInsightsIdeaId}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <NewIdeaModal
        open={showNewIdea}
        onClose={() => setShowNewIdea(false)}
        onSubmit={async (newIdea) => {
          try {
            const response = await fetch("/api/ideas", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(newIdea),
            });
            const payload = (await response.json()) as {
              ok: boolean;
              idea?: FeedIdea;
              message?: string;
            };

            if (!response.ok || !payload.ok || !payload.idea) {
              setIdeasError(payload.message ?? "Failed to create idea");
              return;
            }

            setIdeas((prev) => [payload.idea as FeedIdea, ...prev]);
          } catch {
            setIdeasError("Failed to create idea");
          }
        }}
      />

      {/* Profile / My Ideas panel */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0D0D0D]">
          <div className="flex items-center gap-4 border-b border-white/8 px-5 py-4">
            <button
              type="button"
              onClick={() => setShowProfile(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="size-5" />
            </button>
            <h2 className="text-lg font-bold text-white">My Ideas</h2>
          </div>

          <div className="hide-scrollbar flex-1 overflow-y-auto px-5 py-6">
            {myIdeas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                  <FileText className="size-7 text-white/20" />
                </div>
                <p className="text-sm text-white/40">No ideas posted yet.</p>
                <button
                  type="button"
                  onClick={() => {
                    setShowProfile(false);
                    setShowNewIdea(true);
                  }}
                  className="mt-4 rounded-full bg-[#00FF85]/10 px-5 py-2 text-sm font-medium text-[#00FF85] transition-colors hover:bg-[#00FF85]/20"
                >
                  Post your first idea
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myIdeas.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col gap-3 rounded-2xl border border-white/15 p-5 ring-1 ring-inset ring-white/8 transition-all duration-300 hover:border-[#00FF85]/45 hover:ring-[#00FF85]/25"
                    style={{ backgroundColor: item.color }}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setShowProfile(false);
                      setReelFocusIdeaId(item.id);
                      setReelMode(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setShowProfile(false);
                        setReelFocusIdeaId(item.id);
                        setReelMode(true);
                      }
                    }}
                  >
                    <span className="w-fit rounded-full bg-[#00FF85]/15 px-3 py-0.5 text-[11px] font-medium text-[#00FF85]">
                      {item.category}
                    </span>
                    <p className="text-lg font-bold text-white">{item.title}</p>
                    <p className="text-sm leading-relaxed text-white">
                      {item.idea}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAnalyticsIdeaId(item.id);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur-sm transition-colors hover:border-[#00FF85]/40 hover:bg-[#00FF85]/10 hover:text-[#00FF85]"
                      >
                        <BarChart3 className="size-3.5" />
                        Analytics
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const response = await fetch(`/api/ideas/${item.id}`, {
                            method: "DELETE",
                          });
                          const payload = (await response.json()) as {
                            ok: boolean;
                            message?: string;
                          };

                          if (!response.ok || !payload.ok) {
                            setIdeasError(payload.message ?? "Failed to delete idea");
                            return;
                          }

                          setIdeas((prev) => prev.filter((i) => i.id !== item.id));
                        } catch {
                          setIdeasError("Failed to delete idea");
                        }
                      }}
                      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/50 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-[#FF0099]/20 hover:text-[#FF0099]"
                      title="Delete idea"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {analyticsIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#161616] p-5 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-[#00FF85]/25 to-[#1E90FF]/15 ring-1 ring-[#00FF85]/30">
                  <BarChart3 className="size-4 text-[#00FF85]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold tracking-tight text-white">
                    Analytics
                  </h3>
                  <p className="text-[11px] text-white/40">
                    Performance for this idea
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAnalyticsIdeaId(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close analytics"
              >
                <X className="size-5" />
              </button>
            </div>
            <IdeaAnalyticsCard
              idea={analyticsIdea}
              rank={analyticsRank || 1}
              totalIdeas={myIdeas.length}
              maxHotScore={analyticsMaxHotScore}
            />
          </div>
        </div>
      )}
      {selectedIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-2xl border border-white/10 bg-[#161616] p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedIdeaId(null)}
              className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close info"
            >
              ×
            </button>
            <p className="text-sm leading-relaxed text-white/80">
              {selectedIdea.description?.trim()
                ? selectedIdea.description
                : "No description was provided for this idea yet."}
            </p>
          </div>
        </div>
      )}
      {commentsIdea && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm sm:items-center">
          <div className="relative flex h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl border border-white/10 bg-[#161616] shadow-2xl sm:h-[80vh] sm:max-w-lg sm:rounded-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-4">
              <h3 className="text-lg font-bold text-white">Comments</h3>
              <button
                type="button"
                onClick={closeComments}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close comments"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="hide-scrollbar flex-1 overflow-y-auto px-5 py-4">
              {isLoadingComments ? (
                <div className="flex h-full items-center justify-center text-sm text-white/40">
                  Loading comments...
                </div>
              ) : comments.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
                  <MessageCircle className="size-8 text-white/20" />
                  <p className="text-sm text-white/40">
                    Be the first to comment.
                  </p>
                </div>
              ) : (
                <ul className="flex flex-col gap-4">
                  {comments.map((c) => (
                    <li key={c.id} className="flex gap-3">
                      {c.authorImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={c.authorImage}
                          alt={c.authorName}
                          className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-white/10"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E90FF] text-xs font-semibold text-white">
                          {c.authorName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0 flex-1 rounded-xl bg-white/5 px-3 py-2">
                        <div className="flex items-center justify-between gap-3">
                          <p className="truncate text-sm font-semibold text-white">
                            {c.authorName}
                          </p>
                          <span className="shrink-0 text-[11px] text-white/35">
                            {new Date(c.createdAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-white/80">
                          {c.body}
                        </p>
                        <div className="mt-2 flex items-center gap-4">
                          <button
                            type="button"
                            onClick={() => toggleCommentLike(c.id)}
                            disabled={!userEmail}
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-white/40 transition-colors hover:text-[#FF0099] disabled:opacity-50"
                          >
                            <Heart
                              className={`size-3.5 ${c.isLiked ? "fill-[#FF0099] text-[#FF0099]" : ""}`}
                            />
                            <span>{c.likeCount}</span>
                          </button>
                          {c.isOwn && (
                            <button
                              type="button"
                              onClick={() => deleteComment(c.id)}
                              className="text-[11px] font-medium text-[#FF0099]/70 transition-colors hover:text-[#FF0099]"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void postComment();
              }}
              className="flex items-end gap-2 border-t border-white/8 bg-[#0D0D0D] px-4 py-3"
            >
              <textarea
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void postComment();
                  }
                }}
                placeholder={
                  userEmail ? "Add a comment..." : "Login to comment"
                }
                rows={1}
                maxLength={500}
                disabled={!userEmail || isPostingComment}
                className="max-h-28 flex-1 resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-[#1E90FF]/50 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={
                  !userEmail || isPostingComment || !commentDraft.trim()
                }
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-[#00FF85] px-4 text-sm font-semibold text-[#0D0D0D] transition-colors hover:bg-[#00FF85]/85 disabled:opacity-40"
              >
                {isPostingComment ? "..." : "Post"}
              </button>
            </form>
          </div>
        </div>
      )}
      <AiInsightsModal
        ideaId={insightsIdeaId}
        title={insightsIdea?.title}
        onClose={() => setInsightsIdeaId(null)}
      />
      {(isLoadingIdeas || ideasError || toast) && (
        <div className="pointer-events-none fixed bottom-4 right-4 z-40 rounded-lg border border-white/10 bg-[#161616]/95 px-4 py-2 text-xs text-white/85 shadow-lg">
          {toast ?? (isLoadingIdeas ? "Loading ideas..." : ideasError)}
        </div>
      )}
    </main>
  );
}
