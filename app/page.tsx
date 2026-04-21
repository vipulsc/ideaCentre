import { AiInsights } from "@/components/ai-insights";
import { Community } from "@/components/community";
import { CuriosityPeek } from "@/components/curiosity-peek";
import { FinalCta } from "@/components/final-cta";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { LandingGateIntro } from "@/components/landing-gate-intro";
import { Navbar } from "@/components/navbar";
import { PostIdeaFab } from "@/components/post-idea-fab";
import { Tagline } from "@/components/tagline";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <LandingGateIntro>
      <div className="flex min-h-0 flex-1 flex-col">
        <Navbar />
        <Hero />
        <Tagline />
        <Community />
        <HowItWorks />
        <AiInsights />
        <CuriosityPeek />
        <FinalCta />
        <PostIdeaFab />
      </div>
    </LandingGateIntro>
  );
}
