"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
    router.replace(href);
  }, [href, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas text-sm text-foreground/60">
      Redirecting…
    </main>
  );
}
