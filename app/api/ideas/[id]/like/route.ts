import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  getUserIdByEmail,
  ideaNotFoundResponse,
  invalidOriginResponse,
  isIdeaPublished,
  isSameOrigin,
  serverErrorResponse,
  tooManyRequestsResponse,
  unauthorizedResponse,
} from "@/lib/api/guards";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function toggleLikeFallback(
  userId: string,
  ideaId: string,
): Promise<{ isLiked: boolean; likeCount: number }> {
  const supabase = getSupabaseAdminClient();

  const { data: existingLike } = await supabase
    .from("likes")
    .select("idea_id")
    .filter("user_id", "eq", userId)
    .filter("idea_id", "eq", ideaId)
    .maybeSingle();

  if (existingLike) {
    const { error: unlikeError } = await supabase
      .from("likes")
      .delete()
      .filter("user_id", "eq", userId)
      .filter("idea_id", "eq", ideaId);
    if (unlikeError) throw new Error(unlikeError.message);
  } else {
    const { error: likeError } = await supabase.from("likes").insert({
      user_id: userId,
      idea_id: ideaId,
    });
    // Unique violation = concurrent like already inserted
    if (likeError && likeError.code !== "23505") {
      throw new Error(likeError.message);
    }
  }

  const { data: again } = await supabase
    .from("likes")
    .select("idea_id")
    .filter("user_id", "eq", userId)
    .filter("idea_id", "eq", ideaId)
    .maybeSingle();

  const { count, error: countError } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .filter("idea_id", "eq", ideaId);

  if (countError) throw new Error(countError.message);

  const likeCount = count ?? 0;
  await supabase
    .from("ideas")
    .update({ like_count: likeCount })
    .filter("id", "eq", ideaId);

  return { isLiked: Boolean(again), likeCount };
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!isSameOrigin(request)) {
      return invalidOriginResponse();
    }

    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return unauthorizedResponse();
    }

    const { id: ideaId } = await context.params;
    if (!UUID_RE.test(ideaId)) {
      return NextResponse.json(
        { ok: false, message: "Invalid idea id" },
        { status: 400 },
      );
    }

    const rate = await consumeRateLimit({
      key: `like:${email}`,
      limit: 60,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return tooManyRequestsResponse();
    }

    const supabase = getSupabaseAdminClient();

    if (!(await isIdeaPublished(supabase, ideaId))) {
      return ideaNotFoundResponse();
    }

    const userId = await getUserIdByEmail(supabase, email);
    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 },
      );
    }

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "toggle_idea_like",
      {
        p_user_id: userId,
        p_idea_id: ideaId,
      },
    );

    if (!rpcError) {
      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (
        row &&
        typeof row === "object" &&
        "is_liked" in row &&
        "like_count" in row
      ) {
        return NextResponse.json({
          ok: true,
          isLiked: Boolean((row as { is_liked: boolean }).is_liked),
          likeCount: Number((row as { like_count: number }).like_count) || 0,
        });
      }
    }

    const fallback = await toggleLikeFallback(userId, ideaId);
    return NextResponse.json({ ok: true, ...fallback });
  } catch (error) {
    return serverErrorResponse("Idea like failed", error);
  }
}
