"use client";

import { signIn } from "next-auth/react";

const DEFAULT_CALLBACK_URL = "/dashboard";

export function safeInternalPath(value: string | null | undefined) {
  if (!value?.startsWith("/") || value.startsWith("//")) {
    return null;
  }

  try {
    const parsed = new URL(value, window.location.origin);
    if (parsed.origin !== window.location.origin) return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function currentInternalPath(fallback = DEFAULT_CALLBACK_URL) {
  if (typeof window === "undefined") return fallback;

  return (
    safeInternalPath(
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    ) ?? fallback
  );
}

export function signInWithGoogle(callbackUrl = DEFAULT_CALLBACK_URL) {
  return signIn("google", { callbackUrl });
}
