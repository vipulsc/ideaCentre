"use client";

import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { safeInternalPath } from "@/lib/auth-path";

type AuthRedirectProps = {
  fallbackHref?: string;
};

/**
 * Client-side resume when the home page was served without a session
 * (static/edge cache) but the browser already has a NextAuth cookie.
 */
export function AuthRedirect({ fallbackHref = "/dashboard" }: AuthRedirectProps) {
  const { status } = useSession();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status !== "authenticated") return;

    const next = safeInternalPath(searchParams.get("next")) ?? fallbackHref;
    window.location.replace(next);
  }, [status, searchParams, fallbackHref]);

  if (status !== "authenticated") return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-canvas text-sm text-foreground/60">
      Redirecting…
    </div>
  );
}
