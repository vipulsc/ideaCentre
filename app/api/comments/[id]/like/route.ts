import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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
    const supabase = getSupabaseAdminClient();

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (userError || !userRow) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 },
      );
    }

    const { data: existingLike } = await supabase
      .from("comment_likes")
      .select("comment_id")
      .eq("user_id", userRow.id)
      .eq("comment_id", commentId)
      .maybeSingle();

    let isLiked: boolean;
    if (existingLike) {
      const { error: unlikeError } = await supabase
        .from("comment_likes")
        .delete()
        .eq("user_id", userRow.id)
        .eq("comment_id", commentId);

      if (unlikeError) {
        return NextResponse.json(
          { ok: false, message: unlikeError.message },
          { status: 500 },
        );
      }
      isLiked = false;
    } else {
      const { error: likeError } = await supabase.from("comment_likes").insert({
        user_id: userRow.id,
        comment_id: commentId,
      });

      if (likeError) {
        return NextResponse.json(
          { ok: false, message: likeError.message },
          { status: 500 },
        );
      }
      isLiked = true;
    }

    const { count, error: countError } = await supabase
      .from("comment_likes")
      .select("*", { count: "exact", head: true })
      .eq("comment_id", commentId);

    if (countError) {
      return NextResponse.json(
        { ok: false, message: countError.message },
        { status: 500 },
      );
    }

    const likeCount = count ?? 0;
    const { error: updateError } = await supabase
      .from("comments")
      .update({ like_count: likeCount })
      .eq("id", commentId);

    if (updateError) {
      return NextResponse.json(
        { ok: false, message: updateError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, isLiked, likeCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
