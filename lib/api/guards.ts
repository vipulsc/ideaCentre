import "server-only";

import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

type AdminClient = ReturnType<typeof getSupabaseAdminClient>;

/**
 * Verifies a state-changing request originates from the same site.
 * Browsers always send an `Origin` header on `fetch` mutations, so a missing
 * or mismatched origin is rejected. This is a lightweight CSRF defense that
 * complements NextAuth's own cookie handling.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function invalidOriginResponse() {
  return NextResponse.json(
    { ok: false, message: "Invalid request origin" },
    { status: 403 },
  );
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { ok: false, message: "Unauthorized" },
    { status: 401 },
  );
}

export function tooManyRequestsResponse(
  message = "Too many requests. Please try again shortly.",
) {
  return NextResponse.json({ ok: false, message }, { status: 429 });
}

/**
 * Logs the underlying error server-side and returns a generic client message
 * so database/schema details are never leaked to callers.
 */
export function serverErrorResponse(context: string, error: unknown) {
  console.error(context, error);
  return NextResponse.json(
    { ok: false, message: "Something went wrong. Please try again." },
    { status: 500 },
  );
}

/** Safely parses a JSON request body, returning null on malformed input. */
export async function readJsonBody<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/** Looks up the internal user id for a session email. */
export async function getUserIdByEmail(
  supabase: AdminClient,
  email: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("users")
    .select("id")
    .filter("email", "eq", email)
    .maybeSingle();
  if (data && "id" in data) {
    return (data as { id: string }).id;
  }
  return null;
}

/** Returns true only when the idea exists and is currently published. */
export async function isIdeaPublished(
  supabase: AdminClient,
  ideaId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("ideas")
    .select("status")
    .filter("id", "eq", ideaId)
    .maybeSingle();
  return Boolean(data && (data as { status?: string }).status === "published");
}

export function ideaNotFoundResponse() {
  return NextResponse.json(
    { ok: false, message: "Idea not found" },
    { status: 404 },
  );
}
