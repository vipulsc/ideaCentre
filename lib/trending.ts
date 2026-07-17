/**
 * ──────────────────────────────────────────────────────────────────────────
 *  Trending / Hot-Score Ranking Algorithm
 * ──────────────────────────────────────────────────────────────────────────
 *
 *  Production ranking for the idea feed. Hybrid of EdgeRank, Reddit hot,
 *  Hacker News gravity, Twitter velocity, and YouTube freshness.
 *
 *  Global ranking contract:
 *    1. Score a candidate window of recent published ideas (not one page).
 *    2. `scope=trending` returns only the capped Hot slice (max TRENDING_FEED_LIMIT),
 *       sorted by hotScore and paginated.
 *    3. Home/saved/mine feeds stay chronological; Hot badges use the same
 *       global top slice so badges match the Trending feed.
 *
 *      engagement = W_LIKE · likes + W_COMMENT · comments + W_SHARE · shares
 *      engScore   = log10( 1 + engagement )
 *      velocity   = engagement / max( ageHours, MIN_VELOCITY_H )
 *      velBoost   = log10( 1 + velocity )
 *      freshness  = 1 + exp( -ageHours / FRESH_TAU )
 *      decay      = ( ageHours + TIME_OFFSET ) ^ GRAVITY
 *
 *      hotScore   = ( engScore + V_WEIGHT · velBoost ) · freshness / decay
 */

// ─── Tunable Constants ────────────────────────────────────────────────────

/** Edge weights for each engagement type (Facebook EdgeRank style). */
export const ENGAGEMENT_WEIGHTS = {
  LIKE: 1,
  COMMENT: 3,
  SHARE: 5,
} as const;

/** Polynomial age-decay exponent. Higher = faster cool-down. */
export const GRAVITY = 1.5;

/** Additive offset on age before decay (hours). */
export const TIME_OFFSET = 2;

/** Contribution weight of the velocity term. */
export const VELOCITY_WEIGHT = 0.6;

/** Floor on age used for velocity (hours). */
export const MIN_VELOCITY_HOURS = 0.5;

/** Freshness boost time constant (hours). */
export const FRESH_TAU = 3;

/**
 * How many recent published ideas to score for global Hot / Trending.
 * Ranking is never page-local — always over this candidate window.
 */
export const TRENDING_CANDIDATE_LIMIT = 500;

/**
 * Hard cap on how many ideas appear in Trending / earn the Hot badge.
 * Keeps the Hot feed selective instead of dumping the whole catalog.
 */
export const TRENDING_FEED_LIMIT = 15;

/**
 * Fraction of the candidate window considered for Hot, before the hard cap.
 */
export const TRENDING_TOP_FRACTION = 0.15;

/** Soft floor when the candidate pool is tiny. */
export const TRENDING_MIN_COUNT = 3;

/** Alias used by ranking — same as the feed hard cap. */
export const TRENDING_MAX_COUNT = TRENDING_FEED_LIMIT;

// ─── Public Types ─────────────────────────────────────────────────────────

export type EngagementInputs = {
  likeCount: number;
  commentCount: number;
  /** Reserved for future share tracking. Defaults to 0. */
  shareCount?: number;
  createdAt?: string | Date | null;
};

export type HotScoreBreakdown = {
  /** Final composite hot score, >= 0. */
  hotScore: number;
  /** Weighted engagement total (before log). */
  engagement: number;
  /** Log-scaled engagement component. */
  engScore: number;
  /** Engagement per hour. */
  velocity: number;
  /** Log-scaled velocity component. */
  velBoost: number;
  /** Freshness multiplier (>= 1). */
  freshness: number;
  /** Time decay denominator. */
  decay: number;
  /** Age of the post in hours (floored at MIN_VELOCITY_HOURS). */
  ageHours: number;
};

// ─── Core Math ────────────────────────────────────────────────────────────

function ageHoursOf(createdAt: EngagementInputs["createdAt"]): number {
  if (!createdAt) return Number.POSITIVE_INFINITY;
  const ms =
    createdAt instanceof Date
      ? createdAt.getTime()
      : new Date(createdAt).getTime();
  if (Number.isNaN(ms)) return Number.POSITIVE_INFINITY;
  return Math.max((Date.now() - ms) / 3_600_000, 0);
}

/**
 * Full breakdown for a single post. Exposed so callers (API, analytics UI)
 * can show per-signal attribution — useful for debugging and for surfacing
 * *why* a post is trending.
 */
export function computeHotScoreBreakdown(
  input: EngagementInputs,
): HotScoreBreakdown {
  const likes = Math.max(0, input.likeCount | 0);
  const comments = Math.max(0, input.commentCount | 0);
  const shares = Math.max(0, (input.shareCount ?? 0) | 0);

  const engagement =
    ENGAGEMENT_WEIGHTS.LIKE * likes +
    ENGAGEMENT_WEIGHTS.COMMENT * comments +
    ENGAGEMENT_WEIGHTS.SHARE * shares;

  const rawAge = ageHoursOf(input.createdAt);
  // If we have no valid timestamp, return a neutral zero.
  if (!Number.isFinite(rawAge)) {
    return {
      hotScore: 0,
      engagement,
      engScore: 0,
      velocity: 0,
      velBoost: 0,
      freshness: 1,
      decay: 1,
      ageHours: 0,
    };
  }

  const ageHours = Math.max(rawAge, MIN_VELOCITY_HOURS);

  const engScore = Math.log10(1 + engagement);
  const velocity = engagement / ageHours;
  const velBoost = Math.log10(1 + velocity);
  const freshness = 1 + Math.exp(-ageHours / FRESH_TAU);
  const decay = Math.pow(ageHours + TIME_OFFSET, GRAVITY);

  const hotScore =
    ((engScore + VELOCITY_WEIGHT * velBoost) * freshness) / decay;

  return {
    hotScore,
    engagement,
    engScore,
    velocity,
    velBoost,
    freshness,
    decay,
    ageHours,
  };
}

/** Convenience: just the final hot score. */
export function computeHotScore(input: EngagementInputs): number {
  return computeHotScoreBreakdown(input).hotScore;
}

// ─── Trending Selection ───────────────────────────────────────────────────

export type TrendingRankingEntry<T> = {
  item: T;
  rank: number; // 1-based
  percentile: number; // 0-100 (100 = top)
  score: number;
  isTrending: boolean;
};

/**
 * Rank a list of ideas by hot score (highest first) and mark the global Hot
 * slice. Pass the full candidate window — never a single pagination page.
 */
export function rankByHotScore<
  T extends { id: string } & EngagementInputs,
>(items: T[]): TrendingRankingEntry<T>[] {
  if (items.length === 0) return [];

  const scored = items.map((item) => ({
    item,
    score: computeHotScore(item),
  }));

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    // Stable tie-break: newer first, then id.
    const aTime = a.item.createdAt
      ? new Date(a.item.createdAt as string | Date).getTime()
      : 0;
    const bTime = b.item.createdAt
      ? new Date(b.item.createdAt as string | Date).getTime()
      : 0;
    if (bTime !== aTime) return bTime - aTime;
    return a.item.id.localeCompare(b.item.id);
  });

  const topCount = Math.min(
    TRENDING_MAX_COUNT,
    Math.max(
      TRENDING_MIN_COUNT,
      Math.ceil(items.length * TRENDING_TOP_FRACTION),
    ),
  );

  return scored.map((entry, index) => {
    const inTopSlice = index < topCount;
    return {
      item: entry.item,
      rank: index + 1,
      percentile: Math.round(((items.length - index) / items.length) * 100),
      score: entry.score,
      isTrending: inTopSlice,
    };
  });
}

/** Ids that should carry the Hot badge for a candidate window. */
export function computeTrendingIdeaIds<
  T extends { id: string } & EngagementInputs,
>(items: T[]): Set<string> {
  const ranked = rankByHotScore(items);
  return new Set(ranked.filter((r) => r.isTrending).map((r) => r.item.id));
}

/** Round hot scores for API payloads. */
export function roundHotScore(score: number): number {
  return Number.isFinite(score) ? Math.round(score * 1000) / 1000 : 0;
}
