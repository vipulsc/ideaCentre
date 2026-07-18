import { Suspense } from "react";
import { AiInsights } from "@/components/ai-insights";
import { AuthRedirect } from "@/components/auth-redirect";
import { Community } from "@/components/community";
import { CuriosityPeek } from "@/components/curiosity-peek";
import { FinalCta } from "@/components/final-cta";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { LandingGateIntro } from "@/components/landing-gate-intro";
import { Navbar } from "@/components/navbar";
import { PostIdeaFab } from "@/components/post-idea-fab";
import { Tagline } from "@/components/tagline";
import type { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import { safeInternalPath } from "@/lib/auth-path";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const session = await getServerSession(authOptions);
  const params = await searchParams;
  const nextRaw = Array.isArray(params.next) ? params.next[0] : params.next;
  const next = safeInternalPath(nextRaw) ?? "/dashboard";

  if (session) {
    redirect(next);
  }

  return (
    <>
      <Suspense fallback={null}>
        <AuthRedirect fallbackHref={next} />
      </Suspense>
      <LandingGateIntro>
        <div className="flex min-h-0 flex-1 flex-col">
          <Navbar />
          <main className="flex min-h-0 flex-1 flex-col">
            <Hero />
            <Tagline />
            <Community />
            <HowItWorks />
            <AiInsights />
            <CuriosityPeek />
            <FinalCta />
            <PostIdeaFab />
          </main>
        </div>
      </LandingGateIntro>
    </>
  );
}
