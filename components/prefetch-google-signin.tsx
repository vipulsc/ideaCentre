"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { prefetchGoogleSignIn } from "@/lib/auth-client";

/** Prefetch CSRF while guests browse so Login click can POST immediately. */
export function PrefetchGoogleSignIn() {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "unauthenticated") return;

    const run = () => prefetchGoogleSignIn();

    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(run, 200);
    return () => window.clearTimeout(timer);
  }, [status]);

  return null;
}
