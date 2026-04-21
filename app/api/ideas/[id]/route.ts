import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function DELETE(
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

    const { id } = await context.params;
    if (!UUID_RE.test(id)) {
      return NextResponse.json(
        { ok: false, message: "Invalid idea id" },
        { status: 400 },
      );
    }
    const supabase = getSupabaseAdminClient();

    const { data: userRow, error: userError } = await supabase
      .from("users")
      .select("id")
      .filter("email", "eq", email)
      .single();

    if (userError || !userRow || !("id" in userRow)) {
      return NextResponse.json(
        { ok: false, message: "User not found" },
        { status: 404 },
      );
    }

    const { data: deletedIdea, error } = await supabase
      .from("ideas")
      .delete()
      .select("id")
      .filter("id", "eq", id)
      .filter("author_id", "eq", userRow.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 },
      );
    }
    if (!deletedIdea) {
      return NextResponse.json(
        { ok: false, message: "Idea not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
