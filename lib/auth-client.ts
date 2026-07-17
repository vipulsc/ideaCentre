"use client";

import { signIn } from "next-auth/react";
import { safeInternalPath } from "@/lib/auth-path";

const DEFAULT_CALLBACK_URL = "/dashboard";

export { safeInternalPath };

export function currentInternalPath(fallback = DEFAULT_CALLBACK_URL) {
  if (typeof window === "undefined") return fallback;

  return (
    safeInternalPath(
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    ) ?? fallback
  );
}

export function signInWithGoogle(callbackUrl = DEFAULT_CALLBACK_URL) {
  const safe = safeInternalPath(callbackUrl) ?? DEFAULT_CALLBACK_URL;
  return signIn("google", { callbackUrl: safe });
}
