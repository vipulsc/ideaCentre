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
      key: `bookmark:${email}`,
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
      "toggle_idea_bookmark",
      {
        p_user_id: userId,
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

    const isBookmarked = await toggleBookmarkFallback(userId, ideaId);
    return NextResponse.json({ ok: true, isBookmarked });
  } catch (error) {
    return serverErrorResponse("Idea bookmark failed", error);
  }
}
