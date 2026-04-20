/**
 * ──────────────────────────────────────────────────────────────────────────
 *  Trending / Hot-Score Ranking Algorithm
 * ──────────────────────────────────────────────────────────────────────────
 *
 *  This module ranks ideas in the reel feed. It is a hybrid of four
 *  well-known production ranking formulas, adapted for a short-lived,
 *  engagement-driven social feed:
 *
 *    1. Facebook  EdgeRank        — weighted engagement with time decay.
 *    2. Reddit    "hot"           — logarithmic vote scaling.
 *    3. Hacker News               — gravity-based age decay.
 *    4. Twitter   "Heavy Ranker"  — engagement velocity + recency boost.
 *    5. YouTube   freshness push  — exponential boost for very new content.
 *
 *  Reference formulas (public sources):
 *
 *    Facebook EdgeRank:
 *        EdgeRank = Σ ( U_e × W_e × D_e )
 *        where U_e = affinity, W_e = edge weight, D_e = time decay.
 *
 *    Reddit hot:
 *        order = log10(max(|votes|, 1))
 *        hot   = sign(votes) · order + age_seconds / 45000
 *
 *    Hacker News:
 *        score = (points - 1) / (age_hours + 2) ^ gravity
 *        gravity ≈ 1.8
 *
 *    Twitter Heavy Ranker (simplified, public talks):
 *        score ≈ engagement_weight · sigmoid(velocity) · recency_factor
 *
 *    YouTube recommendation (from "Deep Neural Networks for YouTube
 *    Recommendations", Covington et al., 2016):
 *        uses an "example age" feature that boosts freshly uploaded
 *        content so the candidate generator doesn't starve new videos.
 *
 * ──────────────────────────────────────────────────────────────────────────
 *  Our combined formula (computed per idea):
 * ──────────────────────────────────────────────────────────────────────────
 *
 *      engagement = W_LIKE · likes + W_COMMENT · comments + W_SHARE · shares
 *      engScore   = log10( 1 + engagement )                       // EdgeRank
 *      velocity   = engagement / max( ageHours, MIN_VELOCITY_H )  // per-hour
 *      velBoost   = log10( 1 + velocity )                         // Twitter
 *      freshness  = 1 + exp( -ageHours / FRESH_TAU )              // YouTube
 *      decay      = ( ageHours + TIME_OFFSET ) ^ GRAVITY          // HN / Reddit
 *
 *      hotScore   = ( engScore + V_WEIGHT · velBoost ) · freshness / decay
 *
 *  Intuition:
 *    - `engScore`  : base engagement, log-scaled so one viral post doesn't
 *                    nuke everything else (Reddit/Facebook style).
 *    - `velBoost`  : rewards posts that are earning engagement *fast*
 *                    (Twitter's velocity signal — something going "up" now).
 *    - `freshness` : asymmetric bonus for content < a few hours old, fades
 *                    quickly (YouTube's new-upload boost).
 *    - `decay`     : polynomial age penalty with gravity — proven on
 *                    Hacker News / Reddit to give a natural half-life.
 *
 *  All constants below can be tuned without touching caller code.
 */

// ─── Tunable Constants ────────────────────────────────────────────────────

/** Edge weights for each engagement type (Facebook EdgeRank style). */
export const ENGAGEMENT_WEIGHTS = {
  LIKE: 1,
  COMMENT: 3, // comments are a much stronger signal than a tap
  SHARE: 5, // shares spread content; strongest organic signal
} as const;

/** Polynomial age-decay exponent. Higher = faster cool-down. */
export const GRAVITY = 1.5;

/**
 * Additive offset on age before applying decay. Prevents divide-by-zero
 * and gives brand-new posts a small grace window.
 */
export const TIME_OFFSET = 2; // hours

/** Contribution weight of the velocity term in the final sum. */
export const VELOCITY_WEIGHT = 0.6;

/**
 * Minimum "age" used in the velocity denominator. Without this, a post that
 * gets its first like 2 seconds after posting would have absurd velocity.
 */
export const MIN_VELOCITY_HOURS = 0.5;

/**
 * Freshness boost time constant (hours). The exponential boost roughly
 * halves every FRESH_TAU hours. At age 0 the freshness multiplier is 2;
 * at age 3·FRESH_TAU it is ≈ 1.05.
 */
export const FRESH_TAU = 3;

/** Fraction of the feed eligible for the "Trending" badge. */
export const TRENDING_TOP_FRACTION = 0.4;

/** Hard bounds on the trending badge count regardless of feed size. */
export const TRENDING_MIN_COUNT = 1;
export const TRENDING_MAX_COUNT = 20;

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
 * Rank a list of ideas by hot score and return full metadata. Callers
 * that just want the set of trending ids can call `computeTrendingIdeaIds`.
 */
export function rankByHotScore<
  T extends { id: string } & EngagementInputs,
>(items: T[]): TrendingRankingEntry<T>[] {
  if (items.length === 0) return [];

  const scored = items.map((item) => ({
    item,
    score: computeHotScore(item),
    engagement:
      ENGAGEMENT_WEIGHTS.LIKE * item.likeCount +
      ENGAGEMENT_WEIGHTS.COMMENT * item.commentCount +
      ENGAGEMENT_WEIGHTS.SHARE * (item.shareCount ?? 0),
  }));

  scored.sort((a, b) => b.score - a.score);

  const topCount = Math.min(
    TRENDING_MAX_COUNT,
    Math.max(TRENDING_MIN_COUNT, Math.ceil(items.length * TRENDING_TOP_FRACTION)),
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

/** Back-compatible shortcut: set of ids that should carry the Hot badge. */
export function computeTrendingIdeaIds<
  T extends { id: string } & EngagementInputs,
>(items: T[]): Set<string> {
  const ranked = rankByHotScore(items);
  return new Set(
    ranked.filter((r) => r.isTrending).map((r) => r.item.id),
  );
}
