import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type CreateCommentBody = {
  body?: string;
};

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
    let { data, error } = await supabase
      .from("comments")
      .select(
        "id,body,created_at,like_count,author_id,users!comments_author_id_fkey(name,image)",
      )
      .filter("idea_id", "eq", ideaId)
      .is("deleted_at", null)
      .order("created_at", { ascending: true })
      .limit(limit);
    let typedData = (data ?? null) as CommentQueryRow[] | null;

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
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 },
      );
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

    const comments = (typedData ?? []).map((row) => ({
      id: row.id,
      body: row.body,
      createdAt: row.created_at,
      likeCount: includeLikeCount ? ((row as { like_count?: number }).like_count ?? 0) : 0,
      isLiked: likedCommentIds.has(row.id),
      authorName: row.users?.name ?? "Anonymous",
      authorImage: row.users?.image ?? null,
      isOwn: viewerUserId ? row.author_id === viewerUserId : false,
    }));

    return NextResponse.json({ ok: true, comments });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
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
    const body = (await request.json()) as CreateCommentBody;
    const text = body.body?.trim() ?? "";

    if (!text) {
      return NextResponse.json(
        { ok: false, message: "Comment cannot be empty" },
        { status: 400 },
      );
    }

    if (text.length > 500) {
      return NextResponse.json(
        { ok: false, message: "Comment too long (max 500 chars)" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdminClient();

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
      return NextResponse.json(
        {
          ok: false,
          message: insertError?.message ?? "Failed to post comment",
        },
        { status: 500 },
      );
    }

    const { count } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .filter("idea_id", "eq", ideaId)
      .is("deleted_at", null);

    const commentCount = count ?? 0;

    await supabase
      .from("ideas")
      .update({ comment_count: commentCount })
      .filter("id", "eq", ideaId);

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
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
