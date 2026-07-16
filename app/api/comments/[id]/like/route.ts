import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function toggleCommentLikeFallback(userId: string, commentId: string) {
  const supabase = getSupabaseAdminClient();

  const { data: existingLike } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .filter("user_id", "eq", userId)
    .filter("comment_id", "eq", commentId)
    .maybeSingle();

  if (existingLike) {
    const { error: unlikeError } = await supabase
      .from("comment_likes")
      .delete()
      .filter("user_id", "eq", userId)
      .filter("comment_id", "eq", commentId);
    if (unlikeError) throw new Error(unlikeError.message);
  } else {
    const { error: likeError } = await supabase.from("comment_likes").insert({
      user_id: userId,
      comment_id: commentId,
    });
    if (likeError && likeError.code !== "23505") {
      throw new Error(likeError.message);
    }
  }

  const { data: again } = await supabase
    .from("comment_likes")
    .select("comment_id")
    .filter("user_id", "eq", userId)
    .filter("comment_id", "eq", commentId)
    .maybeSingle();

  const { count, error: countError } = await supabase
    .from("comment_likes")
    .select("*", { count: "exact", head: true })
    .filter("comment_id", "eq", commentId);

  if (countError) throw new Error(countError.message);

  const likeCount = count ?? 0;
  await supabase
    .from("comments")
    .update({ like_count: likeCount })
    .filter("id", "eq", commentId);

  return { isLiked: Boolean(again), likeCount };
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const { id: commentId } = await context.params;
    if (!UUID_RE.test(commentId)) {
      return NextResponse.json(
        { ok: false, message: "Invalid comment id" },
        { status: 400 },
      );
    }
    const supabase = getSupabaseAdminClient();

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("id")
      .filter("email", "eq", email)
      .single();

    if (userError || !userRow || !("id" in userRow)) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 },
      );
    }

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "toggle_comment_like",
      {
        p_user_id: userRow.id,
        p_comment_id: commentId,
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

    const fallback = await toggleCommentLikeFallback(userRow.id, commentId);
    return NextResponse.json({ ok: true, ...fallback });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
