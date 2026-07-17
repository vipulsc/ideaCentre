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
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  MessageCircle,
  Play,
  Plus,
  Share2,
  Sparkles,
  Trash2,
  User,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
} from "recharts";
import NewIdeaModal from "@/components/new-idea-modal";
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
  isBookmarked: boolean;
  authorName: string;
  authorImage?: string | null;
  isOwn?: boolean;
  trending: boolean;
  music?: string | null;
  createdAt?: string | null;
  hotScore?: number;
  trendingRank?: number;
  trendingPercentile?: number;
};

type FeedComment = {
  id: string;
  body: string;
  createdAt: string;
  likeCount: number;
  isLiked: boolean;
  authorName: string;
  authorImage: string | null;
  isOwn: boolean;
};

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

function ReelCard({
  id,
  title,
  idea,
  author,
  authorImage,
  color,
  tag,
  music,
  isActive,
  isMuted,
  onToggleMute,
  onAutoplayBlocked,
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
  authorImage?: string | null;
  color: string;
  tag: string;
  music?: string | null;
  isActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onAutoplayBlocked?: () => void;
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
  const accent = categoryAccent(tag);
  return (
    <div
      className="relative flex h-full w-full snap-start snap-always flex-col justify-end overflow-hidden text-white"
      style={{
        background: `linear-gradient(180deg, ${color}ee 0%, ${color} 45%, #000000 100%)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.14),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full blur-[120px]"
        style={{ backgroundColor: accent, opacity: 0.22 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/90 via-black/40 to-transparent"
      />

      <ReelAudio
        src={music}
        active={isActive}
        muted={isMuted}
        onAutoplayBlocked={onAutoplayBlocked}
      />

      <button
        type="button"
        onClick={onToggleMute}
        disabled={!music}
        className="dash-icon-btn absolute left-4 top-4 z-20 h-9 gap-1.5 px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50 sm:left-5 sm:top-5"
      >
        {!music || isMuted ? (
          <VolumeX className="size-3.5" />
        ) : (
          <Volume2 className="size-3.5" />
        )}
        {!music ? "No music" : isMuted ? "Unmute" : "Mute"}
      </button>

      {trending && (
        <span className="absolute right-4 top-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-xl sm:right-5 sm:top-5">
          <Flame className="size-3.5 text-[#f472b6]" />
          Hot
        </span>
      )}

      <div className="relative z-10 flex w-full max-w-2xl flex-col gap-4 px-6 pb-32 pr-20 sm:px-10 sm:pr-24">
        <div className="flex items-center gap-2.5">
          {authorImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={authorImage}
              alt={author}
              referrerPolicy="no-referrer"
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-white/25"
            />
          ) : (
            <span
              className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-[#241812]"
              style={{ backgroundColor: accent }}
            >
              {author.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight">
              {author}
            </p>
            <p className="dash-mono-tag" style={{ color: accent }}>
              {tag}
            </p>
          </div>
        </div>
        <h2 className="dash-serif text-4xl font-normal leading-[1.08] tracking-tight text-white sm:text-5xl md:text-[3.25rem]">
          {title}
        </h2>
        <p className="max-w-xl text-base leading-relaxed text-white/75 sm:text-lg">
          {idea}
        </p>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={() => onInfo(id)}
            className="dash-icon-btn h-8 gap-1.5 px-3.5 text-[11px] font-medium"
          >
            <FileText className="size-3.5" />
            Info
          </button>
          <button
            type="button"
            onClick={() => onInsights(id)}
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
          onClick={() => onLike(id)}
          className="flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <span className="dash-icon-btn h-11 w-11">
            <Heart
              className={`size-6 ${
                isLiked ? "fill-[#f472b6] text-[#f472b6]" : "text-white"
              }`}
            />
          </span>
          <span className="text-[11px] font-medium tabular-nums text-white/80">
            {likeCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onComment(id)}
          className="flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <span className="dash-icon-btn h-11 w-11">
            <MessageCircle className="size-6 text-white" />
          </span>
          <span className="text-[11px] font-medium tabular-nums text-white/80">
            {commentCount}
          </span>
        </button>
        <button
          type="button"
          onClick={() => onShare(id)}
          className="flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <span className="dash-icon-btn h-11 w-11">
            <Share2 className="size-5.5 text-white" />
          </span>
          <span className="text-[11px] font-medium text-white/80">Share</span>
        </button>
        <button
          type="button"
          onClick={() => onBookmark(id)}
          className="flex flex-col items-center gap-1 transition-transform active:scale-90"
        >
          <span className="dash-icon-btn h-11 w-11">
            <Bookmark
              className={`size-6 ${
                isBookmarked
                  ? "fill-[#fbbf24] text-[#fbbf24]"
                  : "text-white"
              }`}
            />
          </span>
          <span className="text-[11px] font-medium text-white/80">Save</span>
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
  authorImage,
  color,
  tag,
  music,
  musicActive,
  trending,
  showAnalytics,
  likeCount,
  commentCount,
  isLiked,
  isBookmarked,
  onHoverStart,
  onHoverEnd,
  onLike,
  onAnalytics,
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
  authorImage?: string | null;
  color: string;
  tag: string;
  music?: string | null;
  musicActive: boolean;
  trending?: boolean;
  showAnalytics?: boolean;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  onHoverStart: (ideaId: string) => void;
  onHoverEnd: (ideaId: string) => void;
  onLike: (ideaId: string) => void;
  onAnalytics?: (ideaId: string) => void;
  onInfo: (ideaId: string) => void;
  onComment: (ideaId: string) => void;
  onShare: (ideaId: string) => void;
  onBookmark: (ideaId: string) => void;
  onInsights: (ideaId: string) => void;
}) {
  const accent = categoryAccent(tag);
  const [likePulse, setLikePulse] = useState(false);

  return (
    <article
      className="dash-idea-card group flex flex-col overflow-hidden"
      onMouseEnter={() => onHoverStart(id)}
      onMouseLeave={() => onHoverEnd(id)}
    >
      <ReelAudio
        src={music}
        active={musicActive}
        muted={false}
        preload="none"
      />
      {/* Media / headline block */}
      <div
        className="relative flex min-h-[188px] flex-col justify-between overflow-hidden px-5 pb-4 pt-5"
        style={{
          background: `linear-gradient(155deg, ${color} 0%, ${color}cc 38%, rgba(8,8,10,0.96) 100%)`,
        }}
      >
        {/* ambient light + accent glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(255,255,255,0.22),transparent_55%)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-80"
          style={{ backgroundColor: accent, opacity: 0.28 }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/55 to-transparent"
        />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <span
            className="dash-mono-tag"
            style={{ color: accent }}
          >
            {tag}
          </span>
          <div className="flex shrink-0 items-center gap-1.5">
            {music && (
              <span
                className={`dash-chip border border-white/20 bg-black/40 text-white transition-opacity ${
                  musicActive ? "opacity-100" : "opacity-70"
                }`}
                aria-hidden
              >
                <Volume2
                  className={`size-3 ${
                    musicActive ? "text-[#3bf09a]" : "text-white/80"
                  }`}
                />
                {musicActive ? "Playing" : "Music"}
              </span>
            )}
            {trending && (
              <span className="dash-chip border border-white/20 bg-black/35 text-white">
                <Flame className="size-3 text-[#f472b6]" />
                Hot
              </span>
            )}
            {showAnalytics && onAnalytics && (
              <button
                type="button"
                onClick={() => onAnalytics(id)}
                className="dash-icon-btn h-8 gap-1 px-2.5 text-[10px] font-semibold"
              >
                <BarChart3 className="size-3.5" />
                Stats
              </button>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-4">
          <h3 className="dash-serif text-[24px] font-normal leading-[1.12] tracking-tight text-white [text-wrap:balance]">
            {title}
          </h3>
          <p className="mt-2.5 line-clamp-2 text-[13px] leading-relaxed text-white/70">
            {idea}
          </p>
        </div>
      </div>

      {/* Author + actions footer */}
      <div className="flex flex-col gap-3 bg-[#faf0dc]/[0.04] px-4 pb-4 pt-3.5 backdrop-blur-xl">
        <div className="flex items-center gap-2.5">
          {authorImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={authorImage}
              alt={author}
              referrerPolicy="no-referrer"
              className="h-8 w-8 shrink-0 rounded-full object-cover ring-2 ring-[#faf0dc]/20"
            />
          ) : (
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-[#241812]"
              style={{ backgroundColor: accent }}
            >
              {author.charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold text-[#faf0dc]">
              {author}
            </p>
            <p className="dash-mono-tag truncate text-[#faf0dc]/40">
              #{tag.replace(/[^a-zA-Z0-9]/g, "").toLowerCase()}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => onInfo(id)}
              className="dash-icon-btn h-8 w-8"
              aria-label="Info"
            >
              <FileText className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onInsights(id)}
              className="dash-icon-btn h-8 gap-1 px-2.5 text-[11px] font-semibold"
              style={{ color: accent }}
            >
              <Sparkles className="size-3.5" />
              AI
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-[#faf0dc]/10 pt-3">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setLikePulse(true);
                onLike(id);
              }}
              className="dash-nav-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] text-[#faf0dc]/85 hover:bg-[#faf0dc]/8"
            >
              <Heart
                onAnimationEnd={() => setLikePulse(false)}
                className={`size-[18px] transition-colors ${
                  isLiked ? "fill-[#f472b6] text-[#f472b6]" : ""
                } ${likePulse ? "dash-like-pop" : ""}`}
              />
              <span className="tabular-nums">{likeCount}</span>
            </button>
            <button
              type="button"
              onClick={() => onComment(id)}
              className="dash-nav-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] text-[#faf0dc]/85 hover:bg-[#faf0dc]/8"
            >
              <MessageCircle className="size-[18px]" />
              <span className="tabular-nums">{commentCount}</span>
            </button>
            <button
              type="button"
              onClick={() => onShare(id)}
              className="dash-nav-pill inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[13px] text-[#faf0dc]/85 hover:bg-[#faf0dc]/8"
              aria-label="Share"
            >
              <Share2 className="size-[18px]" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => onBookmark(id)}
            className="dash-nav-pill inline-flex items-center rounded-full px-2.5 py-1.5 text-[#faf0dc]/85 hover:bg-[#faf0dc]/8"
            aria-label="Save"
          >
            <Bookmark
              className={`size-[18px] ${
                isBookmarked ? "fill-[#fbbf24] text-[#fbbf24]" : ""
              }`}
            />
          </button>
        </div>
      </div>
    </article>
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

function PerformanceRing({ value, color }: { value: number; color: string }) {
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
            background={{ fill: "rgba(250,240,220,0.08)" }}
            dataKey="value"
            cornerRadius={8}
            fill={color}
            isAnimationActive={false}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="dash-serif text-2xl leading-none sm:text-[26px]" style={{ color }}>
          {Math.round(clamped)}
        </span>
        <span className="dash-mono-tag mt-0.5 text-[8px] text-[#faf0dc]/45">
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
  const ringColor = isTop ? "#3bf09a" : rank === 2 ? "#fbbf24" : "#60a5fa";

  return (
    <article
      className={`group relative overflow-hidden rounded-[20px] border p-5 ${
        isTop
          ? "border-[#3bf09a]/30 bg-linear-to-br from-[#3bf09a]/[0.08] via-[#faf0dc]/[0.03] to-transparent"
          : "border-[#faf0dc]/12 bg-[#faf0dc]/[0.035]"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full blur-3xl"
        style={{ backgroundColor: ringColor, opacity: isTop ? 0.14 : 0.08 }}
      />

      <header className="relative mb-5 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="dash-mono-tag text-[#faf0dc]/55">
              {idea.category}
            </span>
            <span
              className={`dash-chip border px-2 py-0.5 text-[10px] ${
                isTop
                  ? "border-[#3bf09a]/25 bg-[#3bf09a]/12 text-[#3bf09a]"
                  : "border-[#faf0dc]/12 bg-[#faf0dc]/6 text-[#faf0dc]/55"
              }`}
            >
              #{rank}
              <span className="text-[#faf0dc]/35">/ {totalIdeas}</span>
            </span>
            {idea.trending && (
              <span
                className="dash-chip border border-[#f472b6]/25 bg-[#f472b6]/12 px-2 py-0.5 text-[10px] text-[#f472b6]"
                title="Hot — high engagement adjusted for recency"
              >
                <Flame className="size-3" />
                Hot
              </span>
            )}
          </div>
          <h4 className="dash-serif line-clamp-2 text-xl font-normal leading-snug text-[#faf0dc]">
            {idea.title}
          </h4>
          <p className="text-[11px] text-[#faf0dc]/45">
            Posted {formatRelativeTime(idea.createdAt)}
          </p>
        </div>
        <PerformanceRing value={score} color={ringColor} />
      </header>

      <div className="grid grid-cols-2 gap-2.5">
        <StatPill
          icon={<Heart className="size-3.5 fill-[#f472b6] text-[#f472b6]" />}
          label="Likes"
          value={idea.likeCount}
          color="#f472b6"
        />
        <StatPill
          icon={<MessageCircle className="size-3.5 text-[#60a5fa]" />}
          label="Comments"
          value={idea.commentCount}
          color="#60a5fa"
        />
      </div>

      <div className="mt-2.5 flex items-center justify-between rounded-xl border border-[#faf0dc]/10 bg-[#faf0dc]/[0.03] px-3.5 py-2.5">
        <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[#faf0dc]/50">
          <Sparkles className="size-3.5 text-[#3bf09a]" />
          Total engagement
        </div>
        <span className="dash-serif text-lg leading-none text-[#faf0dc]">
          {engagement}
        </span>
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
      className="rounded-xl border border-[#faf0dc]/10 bg-[#faf0dc]/[0.04] px-3.5 py-2.5"
      style={{ boxShadow: `inset 0 0 0 1px ${color}1a` }}
    >
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-[#faf0dc]/50">
        {icon}
        {label}
      </div>
      <p className="dash-serif mt-1 text-2xl leading-none tabular-nums" style={{ color }}>
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
  const [activeFeed, setActiveFeed] = useState<
    "home" | "trending" | "saved" | "myIdeas"
  >("home");
  const [profileMenu, setProfileMenu] = useState(false);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reelFocusIdeaId, setReelFocusIdeaId] = useState<string | null>(null);
  const [isReelMuted, setIsReelMuted] = useState(false);
  const [hoveredMusicId, setHoveredMusicId] = useState<string | null>(null);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [analyticsIdeaId, setAnalyticsIdeaId] = useState<string | null>(null);
  const [insightsIdeaId, setInsightsIdeaId] = useState<string | null>(null);
  const [commentsIdeaId, setCommentsIdeaId] = useState<string | null>(null);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isPostingIdea, setIsPostingIdea] = useState(false);
  const [postIdeaProgress, setPostIdeaProgress] = useState(0);
  const [commentDraft, setCommentDraft] = useState("");
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [ideas, setIdeas] = useState<FeedIdea[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(true);
  const [ideasError, setIdeasError] = useState<string | null>(null);
  const [hasMoreIdeas, setHasMoreIdeas] = useState(false);
  const [isLoadingMoreIdeas, setIsLoadingMoreIdeas] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const reelScrollRef = useRef<HTMLDivElement>(null);
  const feedOffsetRef = useRef(0);
  const likeInFlightRef = useRef(new Set<string>());
  const bookmarkInFlightRef = useRef(new Set<string>());
  /** Blocks grid hover-music after feed switches (remount mouseenter under cursor). */
  const suppressGridMusicUntilRef = useRef(0);

  const stopGridMusic = useCallback(() => {
    suppressGridMusicUntilRef.current = Date.now() + 400;
    setHoveredMusicId(null);
  }, []);

  const changeFeed = useCallback(
    (next: typeof activeFeed | ((prev: typeof activeFeed) => typeof activeFeed)) => {
      stopGridMusic();
      setActiveFeed(next);
    },
    [stopGridMusic],
  );

  const handleGridMusicHoverStart = useCallback((ideaId: string) => {
    if (Date.now() < suppressGridMusicUntilRef.current) return;
    setHoveredMusicId(ideaId);
  }, []);

  const handleGridMusicHoverEnd = useCallback((ideaId: string) => {
    setHoveredMusicId((prev) => (prev === ideaId ? null : prev));
  }, []);

  useEffect(() => {
    // Feed switches remount cards under the cursor and fire a synthetic mouseenter.
    stopGridMusic();
  }, [activeFeed, stopGridMusic]);

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
  const feedScope =
    activeFeed === "saved"
      ? "saved"
      : activeFeed === "myIdeas"
        ? "mine"
        : activeFeed === "trending"
          ? "trending"
          : "feed";
  const myIdeas = ideas.filter((item) => item.isOwn);
  // Server already returns the correct list for each scope.
  // Hot is ordered by hotScore; other feeds stay chronological.
  const displayedIdeas = ideas.slice().sort((a, b) => {
    if (activeFeed === "trending") {
      const scoreDiff = (b.hotScore ?? 0) - (a.hotScore ?? 0);
      if (scoreDiff !== 0) return scoreDiff;
    }
    const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bTime - aTime;
  });
  const selectedIdea = ideas.find((item) => item.id === selectedIdeaId) ?? null;
  const commentsIdea = ideas.find((item) => item.id === commentsIdeaId) ?? null;
  const analyticsIdea =
    ideas.find((item) => item.id === analyticsIdeaId) ?? null;
  const insightsIdea = ideas.find((item) => item.id === insightsIdeaId) ?? null;
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
  const reelItemIds = useMemo(
    () => displayedIdeas.map((idea) => idea.id),
    [displayedIdeas],
  );

  // Desktop grid keeps the reel pane mounted (`lg:hidden`) — never let it play audio there.
  // Mobile always shows the reel pane. Default narrow=false so desktop never autoplays before measure.
  const [isNarrowViewport, setIsNarrowViewport] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsNarrowViewport(!mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const reelAudioEnabled = reelMode || isNarrowViewport;
  const activeReelId = useActiveReelId(
    reelScrollRef,
    reelItemIds,
    reelAudioEnabled,
  );
  const handleReelAutoplayBlocked = useCallback(() => {
    setIsReelMuted(true);
    showToast("Tap Unmute to play music");
  }, [showToast]);

  const loadIdeas = useCallback(
    async (mode: "replace" | "append" = "replace") => {
      try {
        if (mode === "replace") {
          setIsLoadingIdeas(true);
          feedOffsetRef.current = 0;
        } else {
          if (!hasMoreIdeas || isLoadingMoreIdeas) return;
          setIsLoadingMoreIdeas(true);
        }
        setIdeasError(null);

        const params = new URLSearchParams({
          scope: feedScope,
          limit: "30",
          offset: String(mode === "append" ? feedOffsetRef.current : 0),
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
          setIdeasError(payload.message ?? "Failed to load ideas");
          return;
        }

        feedOffsetRef.current =
          typeof payload.nextOffset === "number"
            ? payload.nextOffset
            : feedOffsetRef.current + payload.ideas.length;
        setHasMoreIdeas(Boolean(payload.hasMore));

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
        setIdeasError("Failed to load ideas");
      } finally {
        setIsLoadingIdeas(false);
        setIsLoadingMoreIdeas(false);
      }
    },
    [feedScope, hasMoreIdeas, isLoadingMoreIdeas],
  );

  useEffect(() => {
    void loadIdeas("replace");
  }, [feedScope]); // eslint-disable-line react-hooks/exhaustive-deps

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
                      payload.commentCount ??
                      Math.max(idea.commentCount - 1, 0),
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
    } finally {
      likeInFlightRef.current.delete(ideaId);
    }
  }, []);

  const toggleBookmark = useCallback(async (ideaId: string) => {
    if (bookmarkInFlightRef.current.has(ideaId)) return;
    bookmarkInFlightRef.current.add(ideaId);
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
    } finally {
      bookmarkInFlightRef.current.delete(ideaId);
    }
  }, []);

  useEffect(() => {
    if (reelMode) stopGridMusic();
  }, [reelMode, stopGridMusic]);

  useEffect(() => {
    if (
      selectedIdeaId ||
      commentsIdeaId ||
      analyticsIdeaId ||
      insightsIdeaId ||
      showNewIdea ||
      showProfile
    ) {
      stopGridMusic();
    }
  }, [
    selectedIdeaId,
    commentsIdeaId,
    analyticsIdeaId,
    insightsIdeaId,
    showNewIdea,
    showProfile,
    stopGridMusic,
  ]);

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

  useEffect(() => {
    if (!isPostingIdea) return;
    const timer = setInterval(() => {
      setPostIdeaProgress((prev) => {
        if (prev >= 92) return prev;
        const step = prev < 45 ? 7 : prev < 75 ? 4 : 2;
        return Math.min(prev + step, 92);
      });
    }, 180);
    return () => clearInterval(timer);
  }, [isPostingIdea]);

  return (
    <main className="relative h-screen overflow-hidden bg-transparent [&_button]:cursor-pointer">
      {/* ─── REEL MODE (mobile always, desktop when toggled) ─── */}
      <div
        className={`relative flex h-full flex-col ${reelMode ? "" : "lg:hidden"}`}
      >
        <div
          ref={reelScrollRef}
          className="hide-scrollbar flex-1 snap-y snap-mandatory overflow-y-auto"
        >
          {displayedIdeas.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
              <div className="dash-glass flex h-16 w-16 items-center justify-center rounded-full">
                <Sparkles
                  className={`size-6 text-white/40 ${isLoadingIdeas ? "animate-pulse" : ""}`}
                />
              </div>
              <p className="text-sm text-white/55">
                {isLoadingIdeas
                  ? "Loading ideas…"
                  : activeFeed === "saved"
                    ? "No saved ideas yet. Tap Save on any card."
                    : "No ideas found."}
              </p>
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
                  authorImage={reel.authorImage}
                  color={reel.color}
                  tag={reel.category}
                  music={reelAudioEnabled ? reel.music : null}
                  isActive={reelAudioEnabled && activeReelId === reel.id}
                  isMuted={isReelMuted}
                  onToggleMute={() => setIsReelMuted((prev) => !prev)}
                  onAutoplayBlocked={handleReelAutoplayBlocked}
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
          {hasMoreIdeas && (
            <div className="flex shrink-0 items-center justify-center py-8">
              <button
                type="button"
                onClick={() => void loadIdeas("append")}
                disabled={isLoadingMoreIdeas}
                className="dash-glass rounded-full px-5 py-2.5 text-sm font-medium text-white/85 disabled:opacity-50"
              >
                {isLoadingMoreIdeas ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>

        {reelMode && (
          <button
            type="button"
            onClick={() => setReelMode(false)}
            className="dash-glass absolute left-4 top-4 z-20 hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white/90 lg:inline-flex"
          >
            <Grid className="size-4" />
            Grid View
          </button>
        )}

        <nav className="absolute inset-x-3 bottom-3 z-10 rounded-[22px] border border-white/12 bg-black/45 px-5 py-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
          <ul className="flex items-center justify-between">
            <li>
              <button
                type="button"
                onClick={() =>
                  changeFeed((prev) =>
                    prev === "trending" ? "home" : "trending",
                  )
                }
                className="dash-nav-pill inline-flex flex-col items-center gap-0.5 px-3 py-1 text-white/60 transition-colors hover:text-white"
              >
                {activeFeed === "trending" ? (
                  <Home className="size-6" strokeWidth={1.75} />
                ) : (
                  <Flame className="size-6" strokeWidth={1.75} />
                )}
                <span className="text-[10px] font-medium">
                  {activeFeed === "trending" ? "Home" : "Hot"}
                </span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setShowNewIdea(true)}
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white text-black shadow-[0_8px_24px_rgba(255,255,255,0.18)] transition-transform active:scale-95"
                aria-label="Create"
              >
                <Plus className="size-6 stroke-[2.25]" />
              </button>
            </li>
            <li className="relative">
              <button
                type="button"
                onClick={() => setProfileMenu((v) => !v)}
                className="dash-nav-pill inline-flex flex-col items-center gap-0.5 px-3 py-1 text-white/60 transition-colors hover:text-white"
              >
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileImage}
                    alt={userName}
                    className="h-6 w-6 rounded-full object-cover ring-2 ring-white/40"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-[10px] font-semibold text-white">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-[10px] font-medium">Profile</span>
              </button>

              {profileMenu && (
                <div
                  ref={profileRef}
                  className="dash-glass-strong absolute bottom-full right-0 z-20 mb-3 w-48 overflow-hidden rounded-2xl py-1.5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenu(false);
                      setShowProfile(true);
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <User className="size-4" />
                    My Ideas
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenu(false);
                      changeFeed("saved");
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/75 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <Bookmark className="size-4" />
                    Saved
                  </button>
                  <div className="mx-3 my-1 h-px bg-white/10" />
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#ff6b78] transition-colors hover:bg-white/8"
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
        <aside
          className={`relative m-3 flex shrink-0 flex-col rounded-[24px] border border-white/10 bg-black/40 py-6 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300 ${
            sidebarCollapsed ? "w-[76px] px-2.5" : "w-56 px-4 lg:w-60"
          }`}
        >
          <div
            className={`mb-8 flex items-center ${
              sidebarCollapsed ? "justify-center" : "justify-between px-1"
            }`}
          >
            <p
              className={`dash-serif text-[26px] font-normal leading-none tracking-tight text-[#faf0dc] ${
                sidebarCollapsed ? "hidden" : ""
              }`}
            >
              idea<span className="text-[#3bf09a]">Centre</span>
            </p>
            <button
              type="button"
              onClick={() => setSidebarCollapsed((prev) => !prev)}
              className="dash-icon-btn h-9 w-9"
              aria-label={
                sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {sidebarCollapsed ? (
                <PanelLeftOpen className="size-4" />
              ) : (
                <PanelLeftClose className="size-4" />
              )}
            </button>
          </div>

          <nav className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => changeFeed("home")}
              className={`dash-nav-pill flex items-center rounded-2xl px-3.5 py-2.5 text-sm transition-colors ${
                activeFeed === "home"
                  ? "bg-[#faf0dc]/14 font-semibold text-[#faf0dc]"
                  : "text-[#faf0dc]/45 hover:bg-[#faf0dc]/8 hover:text-[#faf0dc]/85"
              } ${sidebarCollapsed ? "justify-center px-2" : "gap-3"}`}
              title="Home"
            >
              <Home className="size-5 shrink-0" strokeWidth={activeFeed === "home" ? 2.25 : 1.75} />
              <span className={sidebarCollapsed ? "hidden" : ""}>Home</span>
            </button>
            <button
              type="button"
              onClick={() => changeFeed("trending")}
              className={`dash-nav-pill flex items-center rounded-2xl px-3.5 py-2.5 text-sm transition-colors ${
                activeFeed === "trending"
                  ? "bg-[#faf0dc]/14 font-semibold text-[#faf0dc]"
                  : "text-[#faf0dc]/45 hover:bg-[#faf0dc]/8 hover:text-[#faf0dc]/85"
              } ${sidebarCollapsed ? "justify-center px-2" : "gap-3"}`}
              title="Hot"
            >
              <Flame className="size-5 shrink-0" strokeWidth={activeFeed === "trending" ? 2.25 : 1.75} />
              <span className={sidebarCollapsed ? "hidden" : ""}>Hot</span>
            </button>
            <button
              type="button"
              onClick={() => changeFeed("saved")}
              className={`dash-nav-pill flex items-center rounded-2xl px-3.5 py-2.5 text-sm transition-colors ${
                activeFeed === "saved"
                  ? "bg-[#faf0dc]/14 font-semibold text-[#faf0dc]"
                  : "text-[#faf0dc]/45 hover:bg-[#faf0dc]/8 hover:text-[#faf0dc]/85"
              } ${sidebarCollapsed ? "justify-center px-2" : "gap-3"}`}
              title="Saved"
            >
              <Bookmark className="size-5 shrink-0" strokeWidth={activeFeed === "saved" ? 2.25 : 1.75} />
              <span className={sidebarCollapsed ? "hidden" : ""}>Saved</span>
            </button>
            <button
              type="button"
              onClick={() => changeFeed("myIdeas")}
              className={`dash-nav-pill flex items-center rounded-2xl px-3.5 py-2.5 text-sm transition-colors ${
                activeFeed === "myIdeas"
                  ? "bg-[#faf0dc]/14 font-semibold text-[#faf0dc]"
                  : "text-[#faf0dc]/45 hover:bg-[#faf0dc]/8 hover:text-[#faf0dc]/85"
              } ${sidebarCollapsed ? "justify-center px-2" : "gap-3"}`}
              title="My Ideas"
            >
              <User className="size-5 shrink-0" strokeWidth={activeFeed === "myIdeas" ? 2.25 : 1.75} />
              <span className={sidebarCollapsed ? "hidden" : ""}>My Ideas</span>
            </button>
          </nav>

          <div className={`mt-auto ${sidebarCollapsed ? "" : "px-1"}`}>
            <div
              className={`dash-glass flex items-center rounded-2xl ${
                sidebarCollapsed
                  ? "justify-center p-2"
                  : "gap-2.5 px-3 py-2.5"
              }`}
            >
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImage}
                  alt={userName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-[#faf0dc]/25"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#faf0dc]/15 text-xs font-semibold text-[#faf0dc]">
                  {userName.charAt(0).toUpperCase()}
                </span>
              )}
              <span
                className={`truncate text-sm font-medium text-[#faf0dc]/75 ${
                  sidebarCollapsed ? "hidden" : ""
                }`}
              >
                {userName}
              </span>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className={`mt-3 flex w-full items-center rounded-2xl border border-[#faf0dc]/12 bg-[#faf0dc]/6 px-3.5 py-2.5 text-sm font-medium text-[#faf0dc]/80 transition-colors hover:bg-[#faf0dc]/12 ${
                sidebarCollapsed
                  ? "justify-center gap-0 px-2"
                  : "justify-center gap-2"
              }`}
              title="Logout"
            >
              <LogOut className="size-4" />
              <span className={sidebarCollapsed ? "hidden" : ""}>Logout</span>
            </button>
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto px-6 py-6 lg:px-10">
          <div className="mb-7 flex items-center justify-between gap-4">
            <div>
              <p className="dash-mono-tag text-[#3bf09a]/70">Feed</p>
              <h1 className="dash-serif mt-1 text-[34px] font-normal leading-none tracking-tight text-[#faf0dc]">
                {activeFeed === "saved"
                  ? "Saved Ideas"
                  : activeFeed === "trending"
                    ? "Hot"
                    : activeFeed === "myIdeas"
                      ? "My Ideas"
                      : "For You"}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <div className="animate-reel-hint-in flex items-center gap-2 pr-1">
                <span
                  className="relative top-px hidden text-[18px] leading-none tracking-wide text-[#3bf09a] drop-shadow-[0_0_8px_rgba(59,240,154,0.6)] sm:inline-block"
                  style={{
                    fontFamily:
                      "var(--font-handwritten), 'Caveat', 'Bradley Hand', cursive",
                  }}
                >
                  feel the ideas, try
                </span>
                <span
                  aria-hidden="true"
                  className="hidden items-center text-[#3bf09a] drop-shadow-[0_0_8px_rgba(59,240,154,0.6)] sm:inline-flex"
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
                className="dash-pill-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"
              >
                <Play className="size-3.5 fill-[#241812]" />
                Start Idea Reel
              </button>
            </div>
          </div>
          {displayedIdeas.length === 0 ? (
            <div className="dash-glass rounded-[22px] p-12 text-center text-[#faf0dc]/55">
              {isLoadingIdeas
                ? "Loading ideas…"
                : activeFeed === "saved"
                  ? "No saved ideas yet. Use Save on any idea card."
                  : activeFeed === "trending"
                    ? "No hot ideas yet."
                    : activeFeed === "myIdeas"
                      ? "You haven't posted any ideas yet."
                      : "No ideas found."}
            </div>
          ) : (
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {displayedIdeas.map((reel) => (
                <IdeaCard
                  key={reel.id}
                  id={reel.id}
                  title={reel.title}
                  idea={reel.idea}
                  author={reel.authorName}
                  authorImage={reel.authorImage}
                  color={reel.color}
                  tag={reel.category}
                  music={reel.music}
                  musicActive={hoveredMusicId === reel.id}
                  trending={reel.trending}
                  showAnalytics={activeFeed === "myIdeas"}
                  likeCount={reel.likeCount}
                  commentCount={reel.commentCount}
                  isLiked={reel.isLiked}
                  isBookmarked={reel.isBookmarked}
                  onHoverStart={handleGridMusicHoverStart}
                  onHoverEnd={handleGridMusicHoverEnd}
                  onLike={toggleLike}
                  onAnalytics={setAnalyticsIdeaId}
                  onInfo={setSelectedIdeaId}
                  onComment={openComments}
                  onShare={handleShare}
                  onBookmark={toggleBookmark}
                  onInsights={setInsightsIdeaId}
                />
              ))}
            </div>
          )}
          {hasMoreIdeas && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => void loadIdeas("append")}
                disabled={isLoadingMoreIdeas}
                className="dash-glass rounded-full px-5 py-2 text-sm text-[#faf0dc]/80 transition-colors hover:bg-[#faf0dc]/12 disabled:opacity-50"
              >
                {isLoadingMoreIdeas ? "Loading…" : "Load more"}
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowNewIdea(true)}
          className="dash-pill-primary fixed bottom-7 right-7 z-30 hidden items-center gap-2 rounded-full px-5 py-3 text-sm font-bold lg:inline-flex"
        >
          <Plus className="size-4 stroke-[2.5]" />
          New Idea
        </button>
      </div>
      <NewIdeaModal
        open={showNewIdea}
        onClose={() => setShowNewIdea(false)}
        onSubmit={async (newIdea) => {
          setIsPostingIdea(true);
          setPostIdeaProgress(12);
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
              const message = payload.message ?? "Failed to create idea";
              setIdeasError(message);
              throw new Error(message);
            }

            setIdeas((prev) => [payload.idea as FeedIdea, ...prev]);
            setPostIdeaProgress(100);

            // Pre-warm AI insights in the background so other users' "AI summary"
            // loads instantly (the endpoint caches the result on the idea row).
            void fetch(`/api/ideas/${payload.idea.id}/insights`, {
              method: "GET",
              keepalive: true,
            }).catch(() => {
              // Best-effort warm-up; on-demand generation still works if this fails.
            });
          } catch (err) {
            setPostIdeaProgress(100);
            throw err;
          } finally {
            setTimeout(() => {
              setIsPostingIdea(false);
              setPostIdeaProgress(0);
            }, 260);
          }
        }}
      />

      {isPostingIdea && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-60 flex justify-center px-3 sm:px-4">
          <div className="dash-glass-strong relative w-full max-w-md overflow-hidden rounded-2xl p-3 sm:max-w-lg">
            <div className="mb-1.5 flex items-center justify-between px-1 text-[11px] font-medium text-white/80">
              <span>Posting idea...</span>
              <span className="tabular-nums">{postIdeaProgress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-white transition-all duration-200"
                style={{ width: `${postIdeaProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Profile / My Ideas panel */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black/80 backdrop-blur-2xl">
          <div className="flex items-center gap-4 border-b border-white/10 px-5 py-4">
            <button
              type="button"
              onClick={() => setShowProfile(false)}
              className="dash-icon-btn h-9 w-9"
            >
              <ArrowLeft className="size-5" />
            </button>
            <h2 className="text-lg font-semibold tracking-tight text-white">
              My Ideas
            </h2>
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
                  className="mt-4 rounded-full bg-[#3BF09A]/10 px-5 py-2 text-sm font-medium text-[#3BF09A] transition-colors hover:bg-[#3BF09A]/20"
                >
                  Post your first idea
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myIdeas.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col gap-3 rounded-2xl border border-white/15 p-5 ring-1 ring-inset ring-white/8 transition-all duration-300 hover:border-[#3BF09A]/45 hover:ring-[#3BF09A]/25"
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
                    <span className="w-fit rounded-full bg-[#3BF09A]/15 px-3 py-0.5 text-[11px] font-medium text-[#3BF09A]">
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
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[11px] font-semibold text-white/80 backdrop-blur-sm transition-colors hover:border-[#3BF09A]/40 hover:bg-[#3BF09A]/10 hover:text-[#3BF09A]"
                      >
                        <BarChart3 className="size-3.5" />
                        Analytics
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        const confirmed = window.confirm(
                          `Delete “${item.title}”? This cannot be undone.`,
                        );
                        if (!confirmed) return;
                        try {
                          const response = await fetch(
                            `/api/ideas/${item.id}`,
                            {
                              method: "DELETE",
                            },
                          );
                          const payload = (await response.json()) as {
                            ok: boolean;
                            message?: string;
                          };

                          if (!response.ok || !payload.ok) {
                            setIdeasError(
                              payload.message ?? "Failed to delete idea",
                            );
                            return;
                          }

                          setIdeas((prev) =>
                            prev.filter((i) => i.id !== item.id),
                          );
                        } catch {
                          setIdeasError("Failed to delete idea");
                        }
                      }}
                      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/50 backdrop-blur-sm transition-all hover:bg-[#FF0099]/20 hover:text-[#FF0099] focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100"
                      title="Delete idea"
                      aria-label={`Delete idea: ${item.title}`}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="dash-glass-strong relative w-full max-w-lg rounded-[24px] p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#3bf09a]/25 to-[#60a5fa]/12 ring-1 ring-[#3bf09a]/30">
                  <BarChart3 className="size-4.5 text-[#3bf09a]" />
                </div>
                <div>
                  <p className="dash-mono-tag text-[#3bf09a]/70">Insights</p>
                  <h3 className="dash-serif text-xl font-normal leading-none tracking-tight text-[#faf0dc]">
                    Analytics
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAnalyticsIdeaId(null)}
                className="dash-icon-btn h-9 w-9"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-md">
          <div className="dash-glass-strong relative w-full max-w-xl rounded-[24px] p-6">
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
      {commentsIdea && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center">
          <div className="dash-glass-strong relative flex h-[85vh] w-full flex-col overflow-hidden rounded-t-[28px] sm:h-[80vh] sm:max-w-lg sm:rounded-[28px]">
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                Comments
              </h3>
              <button
                type="button"
                onClick={closeComments}
                className="dash-icon-btn h-9 w-9 shrink-0"
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
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-xs font-semibold text-white">
                          {c.authorName.charAt(0).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0 flex-1 rounded-2xl border border-white/8 bg-white/6 px-3 py-2 backdrop-blur-sm">
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
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-white/40 transition-colors hover:text-[#ff3040] disabled:opacity-50"
                          >
                            <Heart
                              className={`size-3.5 ${c.isLiked ? "fill-[#ff3040] text-[#ff3040]" : ""}`}
                            />
                            <span>{c.likeCount}</span>
                          </button>
                          {c.isOwn && (
                            <button
                              type="button"
                              onClick={() => deleteComment(c.id)}
                              className="text-[11px] font-medium text-[#ff6b78]/80 transition-colors hover:text-[#ff6b78]"
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
              className="flex items-end gap-2 border-t border-white/10 bg-black/40 px-4 py-3 backdrop-blur-xl"
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
                className="max-h-28 flex-1 resize-none rounded-2xl border border-white/12 bg-white/8 px-3.5 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-white/25 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={
                  !userEmail || isPostingComment || !commentDraft.trim()
                }
                className="inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-40"
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
        <div className="dash-glass pointer-events-none fixed bottom-5 right-5 z-40 rounded-2xl px-4 py-2.5 text-xs text-white/85">
          {toast ?? (isLoadingIdeas ? "Loading ideas..." : ideasError)}
        </div>
      )}
    </main>
  );
}
