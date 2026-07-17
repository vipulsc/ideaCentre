"use client";

import { useLayoutEffect, useRef } from "react";
import { signInWithGoogle } from "@/lib/auth-client";

export function LoginGoogleRedirect({ callbackUrl }: { callbackUrl: string }) {
  const started = useRef(false);

  useLayoutEffect(() => {
    if (started.current) return;
    started.current = true;
    void signInWithGoogle(callbackUrl);
  }, [callbackUrl]);

  return (
    <p id="login-status" className="text-sm text-foreground/60">
      Taking you to Google sign-in…
    </p>
  );
}
