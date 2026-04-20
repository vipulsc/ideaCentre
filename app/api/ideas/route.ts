import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { computeHotScoreBreakdown, rankByHotScore } from "@/lib/trending";

type CreateIdeaBody = {
  title?: string;
  idea?: string;
  description?: string;
  color?: string;
  category?: string;
};

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
    .eq("slug", slug)
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
    const { data, error } = await supabase
      .from("ideas")
      .select(
        "id,title,idea,description,background_color,like_count,comment_count,created_at,author_id,status,users!ideas_author_id_fkey(name,email),categories!ideas_category_id_fkey(name)",
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

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
        .eq("email", viewerEmail)
        .maybeSingle();

      if (viewerUser?.id) {
        const { data: likes } = await supabase
          .from("likes")
          .select("idea_id")
          .eq("user_id", viewerUser.id)
          .in("idea_id", ideaIds);

        (likes ?? []).forEach((like) => likedIdeaIds.add(like.idea_id));

        const { data: bookmarks } = await supabase
          .from("bookmarks")
          .select("idea_id")
          .eq("user_id", viewerUser.id)
          .in("idea_id", ideaIds);

        (bookmarks ?? []).forEach((bookmark) =>
          bookmarkedIdeaIds.add(bookmark.idea_id),
        );
      }
    }

    const baseIdeas = (data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      idea: row.idea,
      description: row.description,
      color: row.background_color ?? "#0a1a12",
      likeCount: row.like_count,
      commentCount: row.comment_count,
      category: row.categories?.name ?? "Other",
      authorName: row.users?.name ?? "Anonymous",
      authorEmail: row.users?.email ?? null,
      isLiked: likedIdeaIds.has(row.id),
      isBookmarked: bookmarkedIdeaIds.has(row.id),
      createdAt: row.created_at,
      isOwn: false,
    }));

    const ranked = rankByHotScore(baseIdeas);

    const ideas = ranked.map(({ item, rank, percentile, isTrending }) => {
      const breakdown = computeHotScoreBreakdown(item);
      return {
        ...item,
        trending: isTrending,
        hotScore: Math.round(breakdown.hotScore * 1000) / 1000,
        trendingRank: rank,
        trendingPercentile: percentile,
        hotBreakdown: {
          engagement: breakdown.engagement,
          engScore: Math.round(breakdown.engScore * 1000) / 1000,
          velocity: Math.round(breakdown.velocity * 1000) / 1000,
          velBoost: Math.round(breakdown.velBoost * 1000) / 1000,
          freshness: Math.round(breakdown.freshness * 1000) / 1000,
          decay: Math.round(breakdown.decay * 1000) / 1000,
          ageHours: Math.round(breakdown.ageHours * 100) / 100,
        },
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

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("ideas")
      .insert({
        author_id: authorId,
        category_id: categoryId,
        title,
        idea,
        description: body.description?.trim() || null,
        background_color: body.color?.trim() || "#0a1a12",
      })
      .select(
        "id,title,idea,description,background_color,like_count,comment_count,created_at,users!ideas_author_id_fkey(name,email),categories!ideas_category_id_fkey(name)",
      )
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      idea: {
        id: data.id,
        title: data.title,
        idea: data.idea,
        description: data.description,
        color: data.background_color ?? "#0a1a12",
        likeCount: data.like_count,
        commentCount: data.comment_count,
        category: data.categories?.name ?? category,
        authorName: data.users?.name ?? session.user?.name ?? "You",
        authorEmail: data.users?.email ?? email,
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
