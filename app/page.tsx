import { Suspense } from "react";
import { AiInsights } from "@/components/ai-insights";
import { AuthRedirect } from "@/components/auth-redirect";
import { CinematicSection } from "@/components/cinematic-section";
import { Community } from "@/components/community";
import { CuriosityPeek } from "@/components/curiosity-peek";
import { FinalCta } from "@/components/final-cta";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { LandingGateIntro } from "@/components/landing-gate-intro";
import { Navbar } from "@/components/navbar";
import { PostIdeaFab } from "@/components/post-idea-fab";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Tagline } from "@/components/tagline";
import { ZoomSequence } from "@/components/zoom-sequence";
import { authOptions } from "@/lib/auth";
import { safeInternalPath } from "@/lib/auth-path";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

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
        <SmoothScroll>
          <div className="flex min-h-0 flex-1 flex-col">
            <Navbar />
            <main className="flex min-h-0 flex-1 flex-col">
              {/* Land on the hero; first scroll pins and zooms the camera from
                  the hero into the tagline; scrolling further unlocks the rest. */}
              <ZoomSequence first={<Hero />} second={<Tagline />} />
              <CinematicSection>
                <Community />
              </CinematicSection>
              <CinematicSection>
                <HowItWorks />
              </CinematicSection>
              <CinematicSection>
                <AiInsights />
              </CinematicSection>
              <CinematicSection>
                <CuriosityPeek />
              </CinematicSection>
              <CinematicSection recede={false}>
                <FinalCta />
              </CinematicSection>
              <PostIdeaFab />
            </main>
          </div>
        </SmoothScroll>
      </LandingGateIntro>
    </>
  );
}
