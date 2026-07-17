"use client";

import { getCsrfToken, signIn } from "next-auth/react";
import { safeInternalPath } from "@/lib/auth-path";

const DEFAULT_CALLBACK_URL = "/dashboard";
const GOOGLE_SIGNIN_URL = "/api/auth/signin/google";

export { safeInternalPath };

let csrfCache: string | undefined;
let csrfInflight: Promise<string | undefined> | null = null;

/** Warm the CSRF cookie + serverless auth function before the user clicks Login. */
export function prefetchGoogleSignIn() {
  if (typeof window === "undefined") return;
  if (csrfCache || csrfInflight) return;

  csrfInflight = getCsrfToken()
    .then((token) => {
      if (token) csrfCache = token;
      return token;
    })
    .catch(() => undefined)
    .finally(() => {
      csrfInflight = null;
    });
}

async function resolveCsrfToken() {
  if (csrfCache) return csrfCache;
  if (csrfInflight) {
    const pending = await csrfInflight;
    if (pending) return pending;
  }

  const token = await getCsrfToken();
  if (token) csrfCache = token;
  return token;
}

function submitGoogleSignIn(callbackUrl: string, csrfToken: string) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = GOOGLE_SIGNIN_URL;
  form.style.display = "none";

  const csrfInput = document.createElement("input");
  csrfInput.name = "csrfToken";
  csrfInput.value = csrfToken;
  form.appendChild(csrfInput);

  const callbackInput = document.createElement("input");
  callbackInput.name = "callbackUrl";
  callbackInput.value = callbackUrl;
  form.appendChild(callbackInput);

  document.body.appendChild(form);
  form.submit();
}

export function currentInternalPath(fallback = DEFAULT_CALLBACK_URL) {
  if (typeof window === "undefined") return fallback;

  return (
    safeInternalPath(
      `${window.location.pathname}${window.location.search}${window.location.hash}`,
    ) ?? fallback
  );
}

/**
 * Faster than next-auth's signIn("google"):
 * skips getProviders() and uses a real form POST so the browser follows
 * the 302 to Google immediately (no JSON round-trip).
 */
export async function signInWithGoogle(callbackUrl = DEFAULT_CALLBACK_URL) {
  const safe = safeInternalPath(callbackUrl) ?? DEFAULT_CALLBACK_URL;

  try {
    const csrfToken = await resolveCsrfToken();
    if (csrfToken) {
      submitGoogleSignIn(safe, csrfToken);
      return;
    }
  } catch {
    // fall through
  }

  return signIn("google", { callbackUrl: safe });
}
