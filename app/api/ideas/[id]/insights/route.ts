import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateIdeaInsights, type IdeaInsights } from "@/lib/ai/insights";
import type { Json } from "@/lib/supabase/database.types";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const supabase = getSupabaseAdminClient();

    const { data, error } = await supabase
      .from("ideas")
      .select(
        "id,title,idea,description,insights,categories!ideas_category_id_fkey(name)",
      )
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { ok: false, message: error?.message ?? "Idea not found" },
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
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
