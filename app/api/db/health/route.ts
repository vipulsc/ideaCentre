import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

function isAuthorizedHealthRequest(request: Request) {
  const token = process.env.HEALTH_CHECK_TOKEN?.trim();
  if (!token) return false;

  const header =
    request.headers.get("x-health-token") ??
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  return Boolean(header && header === token);
}

export async function GET(request: Request) {
  try {
    // Operational endpoint: requires a dedicated token, not just any session.
    if (!isAuthorizedHealthRequest(request)) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.from("categories").select("id").limit(1);

    if (error) {
      console.error("DB health check failed", error);
      return NextResponse.json(
        { ok: false, message: "Database check failed" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DB health route crashed", error);
    return NextResponse.json(
      { ok: false, message: "Database check failed" },
      { status: 500 },
    );
  }
}
