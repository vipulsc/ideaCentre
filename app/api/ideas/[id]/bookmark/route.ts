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

    const { data: existing } = await supabase
      .from("bookmarks")
      .select("idea_id")
      .filter("user_id", "eq", userRow.id)
      .filter("idea_id", "eq", ideaId)
      .maybeSingle();

    let isBookmarked: boolean;
    if (existing) {
      const { error: removeError } = await supabase
        .from("bookmarks")
        .delete()
        .filter("user_id", "eq", userRow.id)
        .filter("idea_id", "eq", ideaId);

      if (removeError) {
        return NextResponse.json(
          { ok: false, message: removeError.message },
          { status: 500 },
        );
      }
      isBookmarked = false;
    } else {
      const { error: addError } = await supabase.from("bookmarks").insert({
        user_id: userRow.id,
        idea_id: ideaId,
      });

      if (addError) {
        return NextResponse.json(
          { ok: false, message: addError.message },
          { status: 500 },
        );
      }
      isBookmarked = true;
    }

    return NextResponse.json({ ok: true, isBookmarked });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

