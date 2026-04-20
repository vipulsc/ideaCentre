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

    const { id: ideaId } = await context.params;
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

    const { data: existing } = await supabase
      .from("bookmarks")
      .select("idea_id")
      .eq("user_id", userRow.id)
      .eq("idea_id", ideaId)
      .maybeSingle();

    let isBookmarked: boolean;
    if (existing) {
      const { error: removeError } = await supabase
        .from("bookmarks")
        .delete()
        .eq("user_id", userRow.id)
        .eq("idea_id", ideaId);

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

