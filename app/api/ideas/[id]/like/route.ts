import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

    const { id: ideaId } = await context.params;
    if (!UUID_RE.test(ideaId)) {
      return NextResponse.json(
        { ok: false, message: "Invalid idea id" },
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

    const { data: existingLike } = await supabase
      .from("likes")
      .select("idea_id")
      .filter("user_id", "eq", userRow.id)
      .filter("idea_id", "eq", ideaId)
      .maybeSingle();

    let isLiked: boolean;
    if (existingLike) {
      const { error: unlikeError } = await supabase
        .from("likes")
        .delete()
        .filter("user_id", "eq", userRow.id)
        .filter("idea_id", "eq", ideaId);

      if (unlikeError) {
        return NextResponse.json(
          { ok: false, message: unlikeError.message },
          { status: 500 },
        );
      }

      isLiked = false;
    } else {
      const { error: likeError } = await supabase.from("likes").insert({
        user_id: userRow.id,
        idea_id: ideaId,
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
      .from("likes")
      .select("*", { count: "exact", head: true })
      .filter("idea_id", "eq", ideaId);

    if (countError) {
      return NextResponse.json(
        { ok: false, message: countError.message },
        { status: 500 },
      );
    }

    const likeCount = count ?? 0;
    const { error: updateError } = await supabase
      .from("ideas")
      .update({ like_count: likeCount })
      .filter("id", "eq", ideaId);

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
