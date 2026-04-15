"use client";

import { ArrowLeft, Bookmark, FileText, Flame, Grid, Heart, LogOut, MessageCircle, Play, Plus, Share2, Sparkles, Trash2, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import NewIdeaModal from "@/components/new-idea-modal";

type PostedIdea = {
  id: number;
  title: string;
  idea: string;
  category: string;
  color: string;
};

const DEMO_REELS = [
  { id: 1, title: "AI-powered meal planner", idea: "An app that scans your fridge, suggests healthy recipes, and auto-generates a weekly grocery list using AI.", author: "Sarah K.", color: "#0a1a12", tag: "AI / Health" },
  { id: 2, title: "Neighborhood tool library", idea: "A community platform where neighbors can lend and borrow tools, appliances, and gear instead of buying new.", author: "Mike R.", color: "#0a1225", tag: "Community" },
  { id: 3, title: "Micro-SaaS for freelancers", idea: "An all-in-one dashboard for freelancers to track invoices, contracts, and client communications in one place.", author: "Priya D.", color: "#120a1a", tag: "SaaS" },
  { id: 4, title: "Pet health tracker app", idea: "Track your pet's vaccinations, vet visits, diet, and activity levels with smart reminders and health insights.", author: "Jordan L.", color: "#0a1a12", tag: "Pets / Health" },
  { id: 5, title: "Community skill exchange", idea: "A marketplace where people trade skills instead of money — teach guitar, learn coding, swap tutoring hours.", author: "Alex T.", color: "#0a1225", tag: "Education" },
];

function ReelCard({
  title,
  idea,
  author,
  color,
  tag,
}: {
  title: string;
  idea: string;
  author: string;
  color: string;
  tag: string;
}) {
  return (
    <div
      className="relative flex h-full w-full snap-start snap-always flex-col justify-center px-6 pr-16 sm:px-10 sm:pr-20"
      style={{ backgroundColor: color }}
    >
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <span className="w-fit rounded-full bg-[#00FF85]/15 px-4 py-1 text-xs font-medium text-[#00FF85] sm:text-sm">
          {tag}
        </span>
        <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">{title}</h2>
        <p className="text-base leading-relaxed text-white/70 sm:text-lg md:text-xl">{idea}</p>
        <p className="text-sm text-white/35">by {author}</p>
      </div>

      <div className="absolute bottom-28 right-5 flex flex-col items-center gap-6 sm:right-6 sm:gap-7">
        <button type="button" className="flex flex-col items-center gap-1.5 transition-colors hover:text-[#FF0099]">
          <Heart className="size-7 text-white sm:size-8" />
          <span className="text-xs text-white/60">Like</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1.5 transition-colors hover:text-[#1E90FF]">
          <MessageCircle className="size-7 text-white sm:size-8" />
          <span className="text-xs text-white/60">Comment</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1.5 transition-colors hover:text-[#00FF85]">
          <Share2 className="size-7 text-white sm:size-8" />
          <span className="text-xs text-white/60">Share</span>
        </button>
      </div>

      <div className="absolute bottom-20 left-6 flex gap-3 sm:left-10">
        <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-[#1E90FF]/40 hover:text-[#1E90FF]">
          <FileText className="size-3.5" />
          Info
        </button>
        <button type="button" className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-sm transition-colors hover:border-[#00FF85]/40 hover:text-[#00FF85]">
          <Sparkles className="size-3.5" />
          AI
        </button>
      </div>
    </div>
  );
}

function IdeaCard({
  title,
  idea,
  author,
  color,
  tag,
}: {
  title: string;
  idea: string;
  author: string;
  color: string;
  tag: string;
}) {
  return (
    <div
      className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-white/8 p-5 transition-all hover:border-[#00FF85]/30"
      style={{ backgroundColor: color }}
    >
      <div className="flex flex-col gap-3">
        <span className="w-fit rounded-full bg-[#00FF85]/15 px-3 py-0.5 text-[11px] font-medium text-[#00FF85]">
          {tag}
        </span>
        <p className="text-lg font-bold text-white">{title}</p>
        <p className="text-sm leading-relaxed text-white/65">{idea}</p>
        <p className="text-xs text-white/30">by {author}</p>
      </div>
      <div className="mt-5 flex items-center gap-4 border-t border-white/8 pt-4 text-white/30">
        <button type="button" className="flex items-center gap-1.5 transition-colors hover:text-[#FF0099]">
          <Heart className="size-4" />
          <span className="text-xs">Like</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 transition-colors hover:text-[#1E90FF]">
          <MessageCircle className="size-4" />
          <span className="text-xs">Comment</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 transition-colors hover:text-[#00FF85]">
          <Share2 className="size-4" />
          <span className="text-xs">Share</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 transition-colors hover:text-[#1E90FF]">
          <FileText className="size-4" />
          <span className="text-xs">Info</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 transition-colors hover:text-[#00FF85]">
          <Sparkles className="size-4" />
          <span className="text-xs">AI</span>
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "You";
  const profileImage = session?.user?.image;
  const [reelMode, setReelMode] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [myIdeas, setMyIdeas] = useState<PostedIdea[]>([]);
  const profileRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => setProfileMenu(false), []);

  useEffect(() => {
    if (!profileMenu) return;
    function onClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    }
    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") closeMenu();
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [profileMenu, closeMenu]);

  return (
    <main className="h-screen overflow-hidden bg-[#0D0D0D]">
      {/* ─── REEL MODE (mobile always, desktop when toggled) ─── */}
      <div className={`relative flex h-full flex-col ${reelMode ? "" : "md:hidden"}`}>
        <div className="hide-scrollbar flex-1 snap-y snap-mandatory overflow-y-auto">
          {DEMO_REELS.map((reel) => (
            <div key={reel.id} className="h-full w-full shrink-0">
              <ReelCard title={reel.title} idea={reel.idea} author={reel.author} color={reel.color} tag={reel.tag} />
            </div>
          ))}
        </div>

        {reelMode && (
          <button
            type="button"
            onClick={() => setReelMode(false)}
            className="absolute left-4 top-4 z-20 hidden items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-[#00FF85]/20 hover:text-[#00FF85] md:inline-flex"
          >
            <Grid className="size-4" />
            Grid View
          </button>
        )}

        <nav className="absolute inset-x-0 bottom-0 z-10 border-t border-white/8 bg-[#0D0D0D]/80 px-6 py-3 backdrop-blur-md">
          <ul className="flex items-center justify-between">
            <li>
              <button type="button" className="inline-flex flex-col items-center gap-1 text-white/70 transition-colors hover:text-[#00FF85]">
                <Flame className="size-6" />
                <span className="text-[11px] font-medium">Trending</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setShowNewIdea(true)}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#00FF85] text-[#0D0D0D] transition-colors hover:bg-[#00FF85]/80"
                aria-label="Create"
              >
                <Plus className="size-5 stroke-[2.5]" />
              </button>
            </li>
            <li className="relative">
              <button
                type="button"
                onClick={() => setProfileMenu((v) => !v)}
                className="inline-flex flex-col items-center gap-1 text-white/70 transition-colors hover:text-[#1E90FF]"
              >
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileImage}
                    alt={firstName}
                    className="h-6 w-6 rounded-full object-cover ring-2 ring-[#1E90FF]"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1E90FF] text-[10px] font-semibold text-white">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                )}
                <span className="text-[11px] font-medium">Profile</span>
              </button>

              {profileMenu && (
                <div
                  ref={profileRef}
                  className="absolute bottom-full right-0 z-20 mb-3 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#161616] py-1 shadow-lg shadow-black/50"
                >
                  <button
                    type="button"
                    onClick={() => { setProfileMenu(false); setShowProfile(true); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/8 hover:text-white"
                  >
                    <User className="size-4" />
                    My Ideas
                  </button>
                  <button
                    type="button"
                    onClick={() => setProfileMenu(false)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/8 hover:text-[#1E90FF]"
                  >
                    <Bookmark className="size-4" />
                    Saved
                  </button>
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#FF0099] transition-colors hover:bg-white/8"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </button>
                </div>
              )}
            </li>
          </ul>
        </nav>
      </div>

      {/* ─── DESKTOP: sidebar + scrollable grid feed ─── */}
      <div className={`hidden h-full ${reelMode ? "" : "md:flex"}`}>
        <aside className="flex w-56 shrink-0 flex-col border-r border-white/8 bg-[#111111] px-5 py-8 lg:w-64">
          <p className="mb-10 text-lg font-bold tracking-tight text-white">
            idea<span className="text-[#00FF85]">Centre</span>
          </p>

          <nav className="flex flex-col gap-1">
            <button type="button" className="flex items-center gap-3 rounded-xl bg-[#00FF85]/10 px-4 py-2.5 text-sm font-medium text-[#00FF85]">
              <Flame className="size-5" />
              Trending
            </button>
            <button type="button" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/6 hover:text-white/80">
              <Bookmark className="size-5" />
              Saved
            </button>
            <button
              type="button"
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/6 hover:text-white/80"
            >
              <User className="size-5" />
              My Ideas
            </button>
          </nav>

          <div className="mt-auto">
            <button
              type="button"
              onClick={() => setShowNewIdea(true)}
              className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00FF85] px-4 py-2.5 text-sm font-semibold text-[#0D0D0D] transition-colors hover:bg-[#00FF85]/85"
            >
              <Plus className="size-4 stroke-[2.5]" />
              New Idea
            </button>

            <div className="flex items-center gap-2.5">
              {profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profileImage}
                  alt={firstName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-[#1E90FF]/50"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1E90FF] text-xs font-semibold text-white">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              )}
              <span className="text-sm font-medium text-white/70">{firstName}</span>
            </div>
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto bg-[#0D0D0D] px-8 py-8 lg:px-12">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Discover Ideas</h1>
            <button
              type="button"
              onClick={() => setReelMode(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#00FF85]/30 bg-[#00FF85]/10 px-4 py-2 text-sm font-medium text-[#00FF85] transition-colors hover:bg-[#00FF85]/20"
            >
              <Play className="size-4" />
              Reel Mode
            </button>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {DEMO_REELS.map((reel) => (
              <IdeaCard
                key={reel.id}
                title={reel.title}
                idea={reel.idea}
                author={reel.author}
                color={reel.color}
                tag={reel.tag}
              />
            ))}
          </div>
        </div>
      </div>
      <NewIdeaModal
        open={showNewIdea}
        onClose={() => setShowNewIdea(false)}
        onSubmit={(newIdea) => {
          setMyIdeas((prev) => [
            { id: Date.now(), title: newIdea.title, idea: newIdea.idea, category: newIdea.category, color: newIdea.color },
            ...prev,
          ]);
        }}
      />

      {/* Profile / My Ideas panel */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex flex-col bg-[#0D0D0D]">
          <div className="flex items-center gap-4 border-b border-white/8 px-5 py-4">
            <button
              type="button"
              onClick={() => setShowProfile(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="size-5" />
            </button>
            <h2 className="text-lg font-bold text-white">My Ideas</h2>
          </div>

          <div className="hide-scrollbar flex-1 overflow-y-auto px-5 py-6">
            {myIdeas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                  <FileText className="size-7 text-white/20" />
                </div>
                <p className="text-sm text-white/40">No ideas posted yet.</p>
                <button
                  type="button"
                  onClick={() => { setShowProfile(false); setShowNewIdea(true); }}
                  className="mt-4 rounded-full bg-[#00FF85]/10 px-5 py-2 text-sm font-medium text-[#00FF85] transition-colors hover:bg-[#00FF85]/20"
                >
                  Post your first idea
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myIdeas.map((item) => (
                  <div
                    key={item.id}
                    className="group relative flex flex-col gap-3 rounded-2xl border border-white/8 p-5"
                    style={{ backgroundColor: item.color }}
                  >
                    <span className="w-fit rounded-full bg-[#00FF85]/15 px-3 py-0.5 text-[11px] font-medium text-[#00FF85]">
                      {item.category}
                    </span>
                    <p className="text-lg font-bold text-white">{item.title}</p>
                    <p className="text-sm leading-relaxed text-white/65">{item.idea}</p>
                    <button
                      type="button"
                      onClick={() => setMyIdeas((prev) => prev.filter((i) => i.id !== item.id))}
                      className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/30 text-white/50 opacity-0 backdrop-blur-sm transition-all group-hover:opacity-100 hover:bg-[#FF0099]/20 hover:text-[#FF0099]"
                      title="Delete idea"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
