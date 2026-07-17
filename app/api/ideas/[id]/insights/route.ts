import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { generateIdeaInsights, type IdeaInsights } from "@/lib/ai/insights";
import type { Json } from "@/lib/supabase/database.types";
import { consumeRateLimit } from "@/lib/rate-limit";
import {
  ideaNotFoundResponse,
  invalidOriginResponse,
  isSameOrigin,
  serverErrorResponse,
  tooManyRequestsResponse,
  unauthorizedResponse,
} from "@/lib/api/guards";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// A claim older than this is treated as abandoned and may be re-claimed.
const STALE_CLAIM_MS = 2 * 60_000;

type StoredInsights = IdeaInsights & {
  _generating?: boolean;
  claimedAt?: string;
};

type IdeaRow = {
  id: string;
  title: string;
  idea: string;
  description: string | null;
  insights: StoredInsights | null;
  status: string;
  categories:
    | { name?: string | null }
    | { name?: string | null }[]
    | null;
};

async function loadIdea(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  id: string,
): Promise<IdeaRow | null> {
  const { data } = await supabase
    .from("ideas")
    .select(
      "id,title,idea,description,insights,status,categories!ideas_category_id_fkey(name)",
    )
    .eq("id", id)
    .maybeSingle();
  return (data as IdeaRow | null) ?? null;
}

function categoryName(row: IdeaRow): string {
  if (Array.isArray(row.categories)) {
    return row.categories[0]?.name ?? "Other";
  }
  return row.categories?.name ?? "Other";
}

function ready(insights: StoredInsights | null): boolean {
  return Boolean(insights) && !insights?._generating;
}

function isStaleClaim(insights: StoredInsights | null): boolean {
  if (!insights?._generating) return false;
  const claimedAt = insights.claimedAt ? Date.parse(insights.claimedAt) : 0;
  return !claimedAt || Date.now() - claimedAt > STALE_CLAIM_MS;
}

/** Cache-only read. Never triggers generation or writes. */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
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
    const idea = await loadIdea(supabase, id);
    if (!idea || idea.status !== "published") {
      return ideaNotFoundResponse();
    }

    if (ready(idea.insights)) {
      return NextResponse.json({ ok: true, insights: idea.insights });
    }

    if (idea.insights?._generating && !isStaleClaim(idea.insights)) {
      return NextResponse.json({ ok: true, generating: true }, { status: 202 });
    }

    return NextResponse.json(
      { ok: false, generating: false, message: "Insights not generated yet" },
      { status: 404 },
    );
  } catch (error) {
    return serverErrorResponse("Insights read failed", error);
  }
}

/** Generates insights, claiming a single-owner slot to avoid duplicate Gemini calls. */
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

    const rate = await consumeRateLimit({
      key: `insights:${email}`,
      limit: 10,
      windowMs: 60_000,
    });
    if (!rate.allowed) {
      return tooManyRequestsResponse();
    }

    const { id } = await context.params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { ok: false, message: "Invalid idea id" },
        { status: 400 },
      );
    }

    const supabase = getSupabaseAdminClient();
    const idea = await loadIdea(supabase, id);
    if (!idea || idea.status !== "published") {
      return ideaNotFoundResponse();
    }

    // Cache hit.
    if (ready(idea.insights)) {
      return NextResponse.json({ ok: true, insights: idea.insights });
    }

    // Another request is actively generating.
    if (idea.insights?._generating && !isStaleClaim(idea.insights)) {
      return NextResponse.json({ ok: true, generating: true }, { status: 202 });
    }

    // Release an abandoned claim so it can be re-claimed below.
    if (isStaleClaim(idea.insights)) {
      await supabase.from("ideas").update({ insights: null }).eq("id", id);
    }

    // Claim the slot: only succeeds when insights is currently null.
    const claimPayload = {
      _generating: true,
      claimedAt: new Date().toISOString(),
    } as unknown as Json;
    const { data: claimed } = await supabase
      .from("ideas")
      .update({ insights: claimPayload })
      .eq("id", id)
      .is("insights", null)
      .select("id")
      .maybeSingle();

    if (!claimed) {
      // Lost the race; another request owns generation.
      return NextResponse.json({ ok: true, generating: true }, { status: 202 });
    }

    // We own the claim — generate and persist.
    try {
      const insights = await generateIdeaInsights({
        title: idea.title,
        idea: idea.idea,
        description: idea.description,
        category: categoryName(idea),
      });

      await supabase
        .from("ideas")
        .update({ insights: insights as unknown as Json })
        .eq("id", id);

      return NextResponse.json({ ok: true, insights });
    } catch (genError) {
      // Release the claim so a later attempt can retry.
      await supabase.from("ideas").update({ insights: null }).eq("id", id);
      return serverErrorResponse("Insights generation failed", genError);
    }
  } catch (error) {
    return serverErrorResponse("Insights route failed", error);
  }
}
