import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
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
