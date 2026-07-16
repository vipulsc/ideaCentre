import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type ConsumeResult = {
  allowed: boolean;
  remaining: number;
};

/**
 * Durable per-key rate limit backed by Supabase (survives cold starts).
 * Falls back to in-memory if the rate_limits table is missing.
 */
const memoryBuckets = new Map<string, number[]>();

function consumeMemory(
  key: string,
  limit: number,
  windowMs: number,
): ConsumeResult {
  const now = Date.now();
  const prev = memoryBuckets.get(key) ?? [];
  const recent = prev.filter((ts) => now - ts < windowMs);
  if (recent.length >= limit) {
    memoryBuckets.set(key, recent);
    return { allowed: false, remaining: 0 };
  }
  recent.push(now);
  memoryBuckets.set(key, recent);
  return { allowed: true, remaining: Math.max(limit - recent.length, 0) };
}

export async function consumeRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<ConsumeResult> {
  const { key, limit, windowMs } = params;
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.rpc("consume_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.warn("rate_limit rpc unavailable, using memory", error.message);
      return consumeMemory(key, limit, windowMs);
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (
      row &&
      typeof row === "object" &&
      "allowed" in row &&
      typeof (row as { allowed: unknown }).allowed === "boolean"
    ) {
      const allowed = (row as { allowed: boolean }).allowed;
      const remaining =
        typeof (row as { remaining?: unknown }).remaining === "number"
          ? (row as { remaining: number }).remaining
          : allowed
            ? limit - 1
            : 0;
      return { allowed, remaining };
    }

    return consumeMemory(key, limit, windowMs);
  } catch (err) {
    console.warn("rate_limit failed, using memory", err);
    return consumeMemory(key, limit, windowMs);
  }
}
