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

    const { id } = await context.params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { ok: false, message: "Invalid idea id" },
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

    const { data: removedIdea, error } = await supabase
      .from("ideas")
      .update({ status: "removed", updated_at: new Date().toISOString() })
      .select("id")
      .filter("id", "eq", id)
      .filter("author_id", "eq", userId)
      .filter("status", "eq", "published")
      .maybeSingle();

    if (error) {
      return serverErrorResponse("Idea delete failed", error);
    }
    if (!removedIdea) {
      return NextResponse.json(
        { ok: false, message: "Idea not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return serverErrorResponse("Idea delete failed", error);
  }
}
