import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { rankByHotScore } from "@/lib/trending";
import {
  FEED_MAX_PAGE_SIZE,
  FEED_PAGE_SIZE,
  normalizeIdeaFields,
} from "@/lib/idea-limits";
import { consumeRateLimit } from "@/lib/rate-limit";

type CreateIdeaBody = {
  title?: string;
  idea?: string;
  description?: string;
  color?: string;
  category?: string;
  music?: string | null;
};

type FeedScope = "feed" | "saved" | "mine";

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

function parseScope(value: string | null): FeedScope {
  if (value === "saved" || value === "mine") return value;
  return "feed";
}

function parseLimit(value: string | null) {
  const n = Number(value ?? FEED_PAGE_SIZE);
  if (!Number.isFinite(n)) return FEED_PAGE_SIZE;
  return Math.min(Math.max(Math.trunc(n), 1), FEED_MAX_PAGE_SIZE);
}

function parseOffset(value: string | null) {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.trunc(n), 10_000);
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

  const { error: upsertError } = await supabase.from("categories").upsert(
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

const IDEA_SELECT_WITH_MUSIC =
  "id,title,idea,description,background_color,music_track,like_count,comment_count,created_at,author_id,status,users!ideas_author_id_fkey(name,image),categories!ideas_category_id_fkey(name)";
const IDEA_SELECT_NO_MUSIC =
  "id,title,idea,description,background_color,like_count,comment_count,created_at,author_id,status,users!ideas_author_id_fkey(name,image),categories!ideas_category_id_fkey(name)";

type IdeaListRow = {
  id: string;
  title: string;
  idea: string;
  description: string | null;
  background_color: string | null;
  music_track?: string | null;
  like_count: number;
  comment_count: number;
  created_at: string;
  author_id: string;
  status: string;
  users:
    | { name: string | null; image: string | null }
    | { name: string | null; image: string | null }[]
    | null;
  categories: { name: string | null } | { name: string | null }[] | null;
};

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const viewerEmail = session?.user?.email ?? null;
    const url = new URL(request.url);
    const scope = parseScope(url.searchParams.get("scope"));
    const limit = parseLimit(url.searchParams.get("limit"));
    const offset = parseOffset(url.searchParams.get("offset"));

    if ((scope === "saved" || scope === "mine") && !viewerEmail) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const supabase = getSupabaseAdminClient();
    let viewerUserId: string | null = null;

    if (viewerEmail) {
      const { data: viewerUser } = await supabase
        .from("users")
        .select("id")
        .filter("email", "eq", viewerEmail)
        .maybeSingle();
      if (viewerUser && "id" in viewerUser) {
        viewerUserId = viewerUser.id;
      }
    }

    if ((scope === "saved" || scope === "mine") && !viewerUserId) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 },
      );
    }

    let ideaIdsFilter: string[] | null = null;
    if (scope === "saved" && viewerUserId) {
      const { data: bookmarks, error: bookmarksError } = await supabase
        .from("bookmarks")
        .select("idea_id")
        .filter("user_id", "eq", viewerUserId)
        .order("created_at", { ascending: false })
        .limit(500);

      if (bookmarksError) {
        return NextResponse.json(
          { ok: false, message: bookmarksError.message },
          { status: 500 },
        );
      }

      ideaIdsFilter = (bookmarks ?? []).map((b) => b.idea_id);
      if (ideaIdsFilter.length === 0) {
        return NextResponse.json({
          ok: true,
          ideas: [],
          nextOffset: null,
          hasMore: false,
        });
      }
    }

    const fetchLimit = limit + 1;

    async function runQuery(select: string) {
      let query = supabase
        .from("ideas")
        .select(select)
        .filter("status", "eq", "published")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(offset, offset + fetchLimit - 1);

      if (scope === "mine" && viewerUserId) {
        query = query.filter("author_id", "eq", viewerUserId);
      }
      if (ideaIdsFilter) {
        query = query.in("id", ideaIdsFilter);
      }

      return query;
    }

    const primaryQuery = await runQuery(IDEA_SELECT_WITH_MUSIC);
    const fallbackQuery = isMissingMusicTrackColumn(primaryQuery.error?.message)
      ? await runQuery(IDEA_SELECT_NO_MUSIC)
      : null;

    const data = (fallbackQuery?.data ?? primaryQuery.data) as
      | IdeaListRow[]
      | null;
    const error = fallbackQuery?.error ?? primaryQuery.error;

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 },
      );
    }

    const rows = data ?? [];
    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    const ideaIds = pageRows.map((row) => row.id);
    const likedIdeaIds = new Set<string>();
    const bookmarkedIdeaIds = new Set<string>();

    if (viewerUserId && ideaIds.length > 0) {
      const { data: likes } = await supabase
        .from("likes")
        .select("idea_id")
        .filter("user_id", "eq", viewerUserId)
        .in("idea_id", ideaIds);

      (likes ?? []).forEach((like) => likedIdeaIds.add(like.idea_id));

      const { data: bookmarks } = await supabase
        .from("bookmarks")
        .select("idea_id")
        .filter("user_id", "eq", viewerUserId)
        .in("idea_id", ideaIds);

      (bookmarks ?? []).forEach((bookmark) =>
        bookmarkedIdeaIds.add(bookmark.idea_id),
      );
    }

    const baseIdeas = pageRows.map((row) => {
      const category = firstRelation(row.categories);
      const author = firstRelation(row.users);

      return {
        id: row.id,
        title: row.title,
        idea: row.idea,
        description: row.description,
        color: row.background_color ?? "#0a1a12",
        music: "music_track" in row ? row.music_track : null,
        likeCount: row.like_count,
        commentCount: row.comment_count,
        category: category?.name ?? "Other",
        authorName: author?.name ?? "Anonymous",
        authorImage: author?.image ?? null,
        isOwn: viewerUserId ? row.author_id === viewerUserId : false,
        isLiked: likedIdeaIds.has(row.id),
        isBookmarked: bookmarkedIdeaIds.has(row.id),
        createdAt: row.created_at,
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

    // Preserve chronological cursor order for pagination (rank is page-local).
    const ideasById = new Map(ideas.map((idea) => [idea.id, idea]));
    const orderedIdeas = pageRows
      .map((row) => ideasById.get(row.id))
      .filter((idea): idea is NonNullable<typeof idea> => Boolean(idea));

    const nextOffset = hasMore ? offset + limit : null;

    return NextResponse.json({
      ok: true,
      ideas: orderedIdeas,
      nextOffset,
      hasMore,
    });
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

    const rate = await consumeRateLimit({
      key: `idea-create:${email}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { ok: false, message: "Too many ideas created. Please try again shortly." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as CreateIdeaBody;
    const { title, idea, description, category } = normalizeIdeaFields(body);

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
    const insertPayload = {
      author_id: authorId,
      category_id: categoryId,
      title,
      idea,
      description,
      background_color: body.color?.trim() || "#0a1a12",
      music_track: body.music?.trim() || null,
      insights: null,
    };

    const primaryInsert = await supabase
      .from("ideas")
      .insert(insertPayload)
      .select(
        "id,title,idea,description,background_color,music_track,like_count,comment_count,created_at,users!ideas_author_id_fkey(name,image),categories!ideas_category_id_fkey(name)",
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
            "id,title,idea,description,background_color,like_count,comment_count,created_at,users!ideas_author_id_fkey(name,image),categories!ideas_category_id_fkey(name)",
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
    const createdAuthor = firstRelation(data.users);
    const createdAuthorName = createdAuthor?.name;
    const createdAuthorImage =
      (createdAuthor as { image?: string | null } | undefined)?.image;

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
        authorImage: createdAuthorImage ?? session.user?.image ?? null,
        isOwn: true,
        isLiked: false,
        isBookmarked: false,
        trending: false,
        createdAt: data.created_at,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
