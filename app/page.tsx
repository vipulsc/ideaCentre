import { Community } from "@/components/community";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { Navbar } from "@/components/navbar";
import { PostIdeaFab } from "@/components/post-idea-fab";
import { Tagline } from "@/components/tagline";

export default function Home() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <Navbar />
      <Hero />
      <Tagline />
      <Community />
      <HowItWorks />
      <PostIdeaFab />
    </div>
  );
}
