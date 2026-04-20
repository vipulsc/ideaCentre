import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function DELETE(
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

    const { data: existing, error: lookupError } = await supabase
      .from("comments")
      .select("id,idea_id,author_id")
      .eq("id", commentId)
      .single();

    if (lookupError || !existing) {
      return NextResponse.json(
        { ok: false, message: "Comment not found" },
        { status: 404 },
      );
    }

    if (existing.author_id !== userRow.id) {
      return NextResponse.json(
        { ok: false, message: "Not allowed" },
        { status: 403 },
      );
    }

    const { error: updateError } = await supabase
      .from("comments")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", commentId);

    if (updateError) {
      return NextResponse.json(
        { ok: false, message: updateError.message },
        { status: 500 },
      );
    }

    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("idea_id", existing.idea_id)
      .is("deleted_at", null);

    const commentCount = count ?? 0;
    await supabase
      .from("ideas")
      .update({ comment_count: commentCount })
      .eq("id", existing.idea_id);

    return NextResponse.json({
      ok: true,
      commentCount,
      ideaId: existing.idea_id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
