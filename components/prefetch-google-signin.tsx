"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { prefetchGoogleSignIn } from "@/lib/auth-client";

/** Prefetch CSRF while guests browse so Login click can POST immediately. */
export function PrefetchGoogleSignIn() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "unauthenticated") return;

    const timer = window.setTimeout(() => prefetchGoogleSignIn(), 200);
    return () => window.clearTimeout(timer);
  }, [status]);

  return null;
}
