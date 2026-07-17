import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getUserIdByEmail,
  invalidOriginResponse,
  isSameOrigin,
  serverErrorResponse,
  unauthorizedResponse,
} from "@/lib/api/guards";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(
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

    const { id: commentId } = await context.params;
    if (!UUID_RE.test(commentId)) {
      return NextResponse.json(
        { ok: false, message: "Invalid comment id" },
        { status: 400 },
      );
    }
    const supabase = getSupabaseAdminClient();

    const userId = await getUserIdByEmail(supabase, email);
    if (!userId) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 },
      );
    }

    // Only match comments that are not already soft-deleted (idempotency).
    const { data: existing, error: lookupError } = await supabase
      .from("comments")
      .select("id,idea_id,author_id")
      .filter("id", "eq", commentId)
      .is("deleted_at", null)
      .maybeSingle();

    if (lookupError) {
      return serverErrorResponse("Comment lookup failed", lookupError);
    }
    if (!existing) {
      return NextResponse.json(
        { ok: false, message: "Comment not found" },
        { status: 404 },
      );
    }

    if (existing.author_id !== userId) {
      return NextResponse.json(
        { ok: false, message: "Not allowed" },
        { status: 403 },
      );
    }

    const { error: updateError } = await supabase
      .from("comments")
      .update({ deleted_at: new Date().toISOString() })
      .filter("id", "eq", commentId);

    if (updateError) {
      return serverErrorResponse("Comment delete failed", updateError);
    }

    // ideas.comment_count is maintained by a DB trigger (migration 008).
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .filter("idea_id", "eq", existing.idea_id)
      .is("deleted_at", null);

    return NextResponse.json({
      ok: true,
      commentCount: count ?? 0,
      ideaId: existing.idea_id,
    });
  } catch (error) {
    return serverErrorResponse("Comment delete failed", error);
  }
}
