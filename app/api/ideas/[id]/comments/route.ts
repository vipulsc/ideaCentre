import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { IDEA_LIMITS } from "@/lib/idea-limits";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  ideaNotFoundResponse,
  invalidOriginResponse,
  isIdeaPublished,
  isSameOrigin,
  readJsonBody,
  serverErrorResponse,
  tooManyRequestsResponse,
  unauthorizedResponse,
} from "@/lib/api/guards";

type CreateCommentBody = {
  body?: string;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type CommentQueryRow = {
  id: string;
  body: string;
  created_at: string;
  author_id: string;
  like_count?: number;
  users:
    | {
        name: string | null;
        image: string | null;
      }
    | {
        name: string | null;
        image: string | null;
      }[]
    | null;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const limit = 100;
    const { id: ideaId } = await context.params;
    if (!UUID_RE.test(ideaId)) {
      return NextResponse.json(
        { ok: false, message: "Invalid idea id" },
        { status: 400 },
      );
    }
    const session = await getServerSession(authOptions);
    const viewerEmail = session?.user?.email ?? null;

    const supabase = getSupabaseAdminClient();
    let includeLikeCount = true;
    const initial = await supabase
      .from("comments")
      .select(
        "id,body,created_at,like_count,author_id,users!comments_author_id_fkey(name,image)",
      )
      .filter("idea_id", "eq", ideaId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(limit);
    let typedData = (initial.data ?? null) as CommentQueryRow[] | null;
    let error = initial.error;

    // Backward compatibility when migration 003_comment_likes.sql
    // hasn't been applied yet.
    if (error?.message?.includes("column comments.like_count does not exist")) {
      includeLikeCount = false;
      const retry = await supabase
        .from("comments")
        .select("id,body,created_at,author_id,users!comments_author_id_fkey(name,image)")
        .filter("idea_id", "eq", ideaId)
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .limit(limit);
      typedData = (retry.data ?? null) as CommentQueryRow[] | null;
      error = retry.error;
    }

    if (error) {
      return serverErrorResponse("Comments query failed", error);
    }

    const commentIds = (typedData ?? []).map((row) => row.id);
    const likedCommentIds = new Set<string>();
    let viewerUserId: string | null = null;

    if (viewerEmail && commentIds.length > 0) {
      const { data: viewerUser } = await supabase
        .from("users")
        .select("id")
        .filter("email", "eq", viewerEmail)
        .maybeSingle();

      if (viewerUser && "id" in viewerUser) {
        viewerUserId = viewerUser.id;
        const { data: likes } = await supabase
          .from("comment_likes")
          .select("comment_id")
          .filter("user_id", "eq", viewerUser.id)
          .in("comment_id", commentIds);

        (likes ?? []).forEach((like) => likedCommentIds.add(like.comment_id));
      }
    }

    const comments = (typedData ?? []).map((row) => {
      const author = firstRelation(row.users);
      return {
        id: row.id,
        body: row.body,
        createdAt: row.created_at,
        likeCount: includeLikeCount
          ? ((row as { like_count?: number }).like_count ?? 0)
          : 0,
        isLiked: likedCommentIds.has(row.id),
        authorName: author?.name ?? "Anonymous",
        authorImage: author?.image ?? null,
        isOwn: viewerUserId ? row.author_id === viewerUserId : false,
      };
    });

    return NextResponse.json({ ok: true, comments });
  } catch (error) {
    return serverErrorResponse("Comments read failed", error);
  }
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
      key: `comment:${email}`,
      limit: 20,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return tooManyRequestsResponse();
    }

    const body = await readJsonBody<CreateCommentBody>(request);
    const text = typeof body?.body === "string" ? body.body.trim() : "";

    if (!text) {
      return NextResponse.json(
        { ok: false, message: "Comment cannot be empty" },
        { status: 400 },
      );
    }

    if (text.length > IDEA_LIMITS.commentMaxChars) {
      return NextResponse.json(
        {
          ok: false,
          message: `Comment too long (max ${IDEA_LIMITS.commentMaxChars} chars)`,
        },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdminClient();

    if (!(await isIdeaPublished(supabase, ideaId))) {
      return ideaNotFoundResponse();
    }

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("id,name,email,image")
      .filter("email", "eq", email)
      .single();

    if (userError || !userRow || !("id" in userRow)) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 },
      );
    }

    const { data: inserted, error: insertError } = await supabase
      .from("comments")
      .insert({
        idea_id: ideaId,
        author_id: userRow.id,
        body: text,
      })
      .select("id,body,created_at")
      .single();

    if (insertError || !inserted) {
      return serverErrorResponse("Comment insert failed", insertError);
    }

    // ideas.comment_count is maintained by a DB trigger (migration 008).
    // We re-read the current count for an accurate response value.
    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .filter("idea_id", "eq", ideaId)
      .is("deleted_at", null);

    const commentCount = count ?? 0;

    return NextResponse.json({
      ok: true,
      commentCount,
      comment: {
        id: inserted.id,
        body: inserted.body,
        createdAt: inserted.created_at,
        likeCount: 0,
        isLiked: false,
        authorName: userRow.name ?? "You",
        authorImage: userRow.image ?? null,
        isOwn: true,
      },
    });
  } catch (error) {
    return serverErrorResponse("Comment create failed", error);
  }
}
