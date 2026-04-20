import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

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

    const { error } = await supabase
      .from("ideas")
      .delete()
      .filter("id", "eq", id)
      .filter("author_id", "eq", userRow.id);

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
