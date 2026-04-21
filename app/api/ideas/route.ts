import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { rankByHotScore } from "@/lib/trending";
import { generateIdeaInsights } from "@/lib/ai/insights";
import type { Json } from "@/lib/supabase/database.types";

type CreateIdeaBody = {
  title?: string;
  idea?: string;
  description?: string;
  color?: string;
  category?: string;
  music?: string | null;
};

function isMissingMusicTrackColumn(message?: string | null) {
  return (message ?? "").toLowerCase().includes("ideas.music_track");
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function slugifyCategory(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function ensureUser(params: {
  email: string;
  name?: string | null;
  image?: string | null;
}) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("users")
    .upsert(
      {
        email: params.email,
        name: params.name ?? null,
        image: params.image ?? null,
      },
      { onConflict: "email" },
    )
    .select("id")
    .single();

  if (error) {
    throw new Error(`Failed to sync user: ${error.message}`);
  }

  return data.id;
}

async function ensureCategoryId(category: string) {
  const supabase = getSupabaseAdminClient();
  const slug = slugifyCategory(category);

  if (!slug) {
    return null;
  }

  const { error: upsertError } = await supabase
    .from("categories")
    .upsert(
      {
        slug,
        name: category.trim(),
      },
      { onConflict: "slug" },
    );

  if (upsertError) {
    throw new Error(`Failed to upsert category: ${upsertError.message}`);
  }

  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .filter("slug", "eq", slug)
    .single();

  if (error) {
    throw new Error(`Failed to fetch category: ${error.message}`);
  }

  return data.id;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const viewerEmail = session?.user?.email ?? null;
    const supabase = getSupabaseAdminClient();
    const primaryQuery = await supabase
      .from("ideas")
      .select(
        "id,title,idea,description,background_color,music_track,like_count,comment_count,created_at,author_id,status,users!ideas_author_id_fkey(name,email),categories!ideas_category_id_fkey(name)",
      )
      .filter("status", "eq", "published")
      .order("created_at", { ascending: false });

    const fallbackQuery = isMissingMusicTrackColumn(primaryQuery.error?.message)
      ? await supabase
          .from("ideas")
          .select(
            "id,title,idea,description,background_color,like_count,comment_count,created_at,author_id,status,users!ideas_author_id_fkey(name,email),categories!ideas_category_id_fkey(name)",
          )
          .filter("status", "eq", "published")
          .order("created_at", { ascending: false })
      : null;

    const data = fallbackQuery?.data ?? primaryQuery.data;
    const error = fallbackQuery?.error ?? primaryQuery.error;

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 },
      );
    }

    const ideaIds = (data ?? []).map((row) => row.id);
    const likedIdeaIds = new Set<string>();
    const bookmarkedIdeaIds = new Set<string>();

    if (viewerEmail && ideaIds.length > 0) {
      const { data: viewerUser } = await supabase
        .from("users")
        .select("id")
        .filter("email", "eq", viewerEmail)
        .maybeSingle();

      if (viewerUser && "id" in viewerUser) {
        const { data: likes } = await supabase
          .from("likes")
          .select("idea_id")
          .filter("user_id", "eq", viewerUser.id)
          .in("idea_id", ideaIds);

        (likes ?? []).forEach((like) => likedIdeaIds.add(like.idea_id));

        const { data: bookmarks } = await supabase
          .from("bookmarks")
          .select("idea_id")
          .filter("user_id", "eq", viewerUser.id)
          .in("idea_id", ideaIds);

        (bookmarks ?? []).forEach((bookmark) =>
          bookmarkedIdeaIds.add(bookmark.idea_id),
        );
      }
    }

    const baseIdeas = (data ?? []).map((row) => {
      const category = firstRelation(row.categories);
      const author = firstRelation(row.users);
      const categoryName = category?.name;
      const authorName = author?.name;
      const authorEmail = author?.email;

      return {
        id: row.id,
        title: row.title,
        idea: row.idea,
        description: row.description,
        color: row.background_color ?? "#0a1a12",
        music: "music_track" in row ? row.music_track : null,
        likeCount: row.like_count,
        commentCount: row.comment_count,
        category: categoryName ?? "Other",
        authorName: authorName ?? "Anonymous",
        authorEmail: authorEmail ?? null,
        isLiked: likedIdeaIds.has(row.id),
        isBookmarked: bookmarkedIdeaIds.has(row.id),
        createdAt: row.created_at,
        isOwn: false,
      };
    });

    const ranked = rankByHotScore(baseIdeas);

    const ideas = ranked.map(({ item, rank, percentile, isTrending, score }) => {
      return {
        ...item,
        trending: isTrending,
        hotScore: Number.isFinite(score) ? Math.round(score * 1000) / 1000 : 0,
        trendingRank: rank,
        trendingPercentile: percentile,
      };
    });

    return NextResponse.json({ ok: true, ideas });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;

    if (!email) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as CreateIdeaBody;
    const title = body.title?.trim() ?? "";
    const idea = body.idea?.trim() ?? "";
    const category = body.category?.trim() ?? "Other";

    if (!title || !idea) {
      return NextResponse.json(
        { ok: false, message: "Title and idea are required" },
        { status: 400 },
      );
    }

    const authorId = await ensureUser({
      email,
      name: session.user?.name,
      image: session.user?.image,
    });
    const categoryId = await ensureCategoryId(category);

    let insights: Json | null = null;
    try {
      const generated = await generateIdeaInsights({
        title,
        idea,
        description: body.description ?? null,
        category,
      });
      insights = generated as unknown as Json;
    } catch (err) {
      console.error("Failed to generate AI insights", err);
    }

    const supabase = getSupabaseAdminClient();
    const insertPayload = {
      author_id: authorId,
      category_id: categoryId,
      title,
      idea,
      description: body.description?.trim() || null,
      background_color: body.color?.trim() || "#0a1a12",
      music_track: body.music?.trim() || null,
      insights,
    };

    const primaryInsert = await supabase
      .from("ideas")
      .insert(insertPayload)
      .select(
        "id,title,idea,description,background_color,music_track,like_count,comment_count,created_at,users!ideas_author_id_fkey(name,email),categories!ideas_category_id_fkey(name)",
      )
      .single();

    const fallbackInsert = isMissingMusicTrackColumn(primaryInsert.error?.message)
      ? await supabase
          .from("ideas")
          .insert({
            ...insertPayload,
            music_track: undefined,
          })
          .select(
            "id,title,idea,description,background_color,like_count,comment_count,created_at,users!ideas_author_id_fkey(name,email),categories!ideas_category_id_fkey(name)",
          )
          .single()
      : null;

    const data = fallbackInsert?.data ?? primaryInsert.data;
    const error = fallbackInsert?.error ?? primaryInsert.error;

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 },
      );
    }
    if (!data) {
      return NextResponse.json(
        { ok: false, message: "Failed to create idea" },
        { status: 500 },
      );
    }

    const createdCategory = firstRelation(data.categories)?.name;
    const createdAuthorName = firstRelation(data.users)?.name;
    const createdAuthorEmail = firstRelation(data.users)?.email;

    return NextResponse.json({
      ok: true,
      idea: {
        id: data.id,
        title: data.title,
        idea: data.idea,
        description: data.description,
        color: data.background_color ?? "#0a1a12",
        music: "music_track" in data ? data.music_track : null,
        likeCount: data.like_count,
        commentCount: data.comment_count,
        category: createdCategory ?? category,
        authorName: createdAuthorName ?? session.user?.name ?? "You",
        authorEmail: createdAuthorEmail ?? email,
        isLiked: false,
        isBookmarked: false,
        trending: false,
        createdAt: data.created_at,
        isOwn: true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
