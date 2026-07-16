import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function toggleBookmarkFallback(userId: string, ideaId: string) {
  const supabase = getSupabaseAdminClient();

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("idea_id")
    .filter("user_id", "eq", userId)
    .filter("idea_id", "eq", ideaId)
    .maybeSingle();

  if (existing) {
    const { error: removeError } = await supabase
      .from("bookmarks")
      .delete()
      .filter("user_id", "eq", userId)
      .filter("idea_id", "eq", ideaId);
    if (removeError) throw new Error(removeError.message);
    return false;
  }

  const { error: addError } = await supabase.from("bookmarks").insert({
    user_id: userId,
    idea_id: ideaId,
  });
  if (addError && addError.code !== "23505") {
    throw new Error(addError.message);
  }
  return true;
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

    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "toggle_idea_bookmark",
      {
        p_user_id: userRow.id,
        p_idea_id: ideaId,
      },
    );

    if (!rpcError) {
      const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (row && typeof row === "object" && "is_bookmarked" in row) {
        return NextResponse.json({
          ok: true,
          isBookmarked: Boolean(
            (row as { is_bookmarked: boolean }).is_bookmarked,
          ),
        });
      }
    }

    const isBookmarked = await toggleBookmarkFallback(userRow.id, ideaId);
    return NextResponse.json({ ok: true, isBookmarked });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
