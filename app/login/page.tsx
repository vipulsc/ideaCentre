"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { safeInternalPath, signInWithGoogle } from "@/lib/auth-client";

function LoginContent() {
  const searchParams = useSearchParams();
  const started = useRef(false);
  const error = searchParams.get("error");
  const callbackUrl =
    safeInternalPath(searchParams.get("callbackUrl")) ?? "/dashboard";

  useEffect(() => {
    if (error || started.current) return;
    started.current = true;
    void signInWithGoogle(callbackUrl);
  }, [callbackUrl, error]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <p className="text-sm text-foreground/70">
          Sign-in didn&apos;t complete. Please try again.
        </p>
        <button
          type="button"
          onClick={() => {
            started.current = true;
            void signInWithGoogle(callbackUrl);
          }}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Try Google again
        </button>
        <Link
          href="/"
          className="text-sm text-foreground/50 underline underline-offset-4"
        >
          Back to home
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas text-sm text-foreground/60">
      Taking you to Google sign-in…
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-canvas text-sm text-foreground/60">
          Taking you to Google sign-in…
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
