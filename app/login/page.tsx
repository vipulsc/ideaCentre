import type { Metadata } from "next";
import Link from "next/link";
import { LoginGoogleRedirect } from "@/components/login-google-redirect";
import { safeInternalPath } from "@/lib/auth-path";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string | string[]; error?: string | string[] }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = firstParam(params.error);
  const callbackUrl =
    safeInternalPath(firstParam(params.callbackUrl)) ?? "/dashboard";

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
        <p className="text-sm text-foreground/70">
          Sign-in didn&apos;t complete. Please try again.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Try Google again
        </Link>
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
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6 text-center">
      <LoginGoogleRedirect callbackUrl={callbackUrl} />
    </main>
  );
}
