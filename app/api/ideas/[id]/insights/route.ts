import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateIdeaInsights, type IdeaInsights } from "@/lib/ai/insights";
import type { Json } from "@/lib/supabase/database.types";

export const runtime = "nodejs";
const rateBucket = new Map<string, number[]>();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 10;
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
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
    const now = Date.now();
    const prev = rateBucket.get(email) ?? [];
    const recent = prev.filter((ts) => now - ts < RATE_WINDOW_MS);
    if (recent.length >= RATE_MAX_REQUESTS) {
      return NextResponse.json(
        { ok: false, message: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }
    recent.push(now);
    rateBucket.set(email, recent);

    const { id } = await context.params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { ok: false, message: "Invalid idea id" },
        { status: 400 },
      );
    }
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from("ideas")
      .select(
        "id,title,idea,description,insights,status,categories!ideas_category_id_fkey(name)",
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, message: error?.message ?? "Idea not found" },
        { status: 404 },
      );
    }

    if (data.status !== "published") {
      return NextResponse.json(
        { ok: false, message: "Idea not found" },
        { status: 404 },
      );
    }

    if (data.insights) {
      return NextResponse.json({
        ok: true,
        insights: data.insights as unknown as IdeaInsights,
      });
    }

    const categoryName = Array.isArray(data.categories)
      ? (data.categories[0]?.name ?? "Other")
      : "Other";

    const insights = await generateIdeaInsights({
      title: data.title,
      idea: data.idea,
      description: data.description,
      category: categoryName,
    });

    await supabase
      .from("ideas")
      .update({ insights: insights as unknown as Json })
      .eq("id", id);

    return NextResponse.json({ ok: true, insights });
  } catch (error) {
    console.error("Insights route failed", error);
    return NextResponse.json(
      { ok: false, message: "Failed to load insights" },
      { status: 500 },
    );
  }
}
