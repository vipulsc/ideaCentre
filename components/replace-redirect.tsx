"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { safeInternalPath } from "@/lib/auth-path";

type ReplaceRedirectProps = {
  href: string;
};

/**
 * Client-side history.replace navigation so authenticated redirects
 * (e.g. / → /dashboard) do not trap the browser Back button.
 */
export function ReplaceRedirect({ href }: ReplaceRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const target = safeInternalPath(params.get("next")) ?? href;

    router.replace(target);

    const fallback = window.setTimeout(() => {
      window.location.replace(target);
    }, 700);

    return () => window.clearTimeout(fallback);
  }, [href, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas text-sm text-foreground/60">
      Redirecting…
    </main>
  );
}
