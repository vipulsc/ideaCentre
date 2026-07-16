import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateIdeaInsights, type IdeaInsights } from "@/lib/ai/insights";
import type { Json } from "@/lib/supabase/database.types";
import { consumeRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

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

    const rate = await consumeRateLimit({
      key: `insights:${email}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        { ok: false, message: "Too many requests. Please try again shortly." },
        { status: 429 },
      );
    }

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

    // Claim generation slot to reduce duplicate Gemini calls under concurrency.
    const { data: claimed, error: claimError } = await supabase
      .from("ideas")
      .update({
        insights: {
          _generating: true,
          claimedAt: new Date().toISOString(),
        } as unknown as Json,
      })
      .eq("id", id)
      .is("insights", null)
      .select("id")
      .maybeSingle();

    if (claimError) {
      console.warn("insights claim failed", claimError.message);
    }

    if (!claimed) {
      // Another request is generating or finished — re-read.
      for (let attempt = 0; attempt < 8; attempt += 1) {
        await new Promise((r) => setTimeout(r, 400 + attempt * 150));
        const { data: again } = await supabase
          .from("ideas")
          .select("insights")
          .eq("id", id)
          .single();
        const insights = again?.insights as
          | (IdeaInsights & { _generating?: boolean })
          | null;
        if (insights && !insights._generating) {
          return NextResponse.json({ ok: true, insights });
        }
      }
    }

    const categoryName = Array.isArray(data.categories)
      ? (data.categories[0]?.name ?? "Other")
      : ((data.categories as { name?: string } | null)?.name ?? "Other");

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
    try {
      const { id } = await context.params;
      if (UUID_RE.test(id)) {
        const supabase = getSupabaseAdminClient();
        const { data: stuck } = await supabase
          .from("ideas")
          .select("insights")
          .eq("id", id)
          .maybeSingle();
        const raw = stuck?.insights as { _generating?: boolean } | null;
        if (raw && raw._generating) {
          await supabase
            .from("ideas")
            .update({ insights: null })
            .eq("id", id);
        }
      }
    } catch {
      // ignore cleanup errors
    }
    return NextResponse.json(
      { ok: false, message: "Failed to load insights" },
      { status: 500 },
    );
  }
}
