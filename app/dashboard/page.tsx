"use client";

import { Bookmark, Grid, Heart, Home, LogOut, MessageCircle, Play, Plus, Share2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";

const DEMO_REELS = [
  { id: 1, title: "AI-powered meal planner", author: "Sarah K.", color: "#0a1a12", tag: "AI / Health" },
  { id: 2, title: "Neighborhood tool library", author: "Mike R.", color: "#0a1225", tag: "Community" },
  { id: 3, title: "Micro-SaaS for freelancers", author: "Priya D.", color: "#120a1a", tag: "SaaS" },
  { id: 4, title: "Pet health tracker app", author: "Jordan L.", color: "#0a1a12", tag: "Pets / Health" },
  { id: 5, title: "Community skill exchange", author: "Alex T.", color: "#0a1225", tag: "Education" },
];

function ReelCard({
  title,
  author,
  color,
}: {
  title: string;
  author: string;
  color: string;
}) {
  return (
    <div
      className="relative flex h-full w-full snap-start snap-always flex-col justify-end"
      style={{ backgroundColor: color }}
    >
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent px-5 pb-20 pt-32">
        <p className="mb-1 text-lg font-bold text-white">{title}</p>
        <p className="text-sm text-white/50">by {author}</p>
      </div>

      <div className="absolute bottom-24 right-4 flex flex-col items-center gap-5">
        <button type="button" className="flex flex-col items-center gap-1 transition-colors hover:text-[#FF0099]">
          <Heart className="size-6 text-white" />
          <span className="text-[11px] text-white/60">Like</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 transition-colors hover:text-[#1E90FF]">
          <MessageCircle className="size-6 text-white" />
          <span className="text-[11px] text-white/60">Comment</span>
        </button>
        <button type="button" className="flex flex-col items-center gap-1 transition-colors hover:text-[#00FF85]">
          <Share2 className="size-6 text-white" />
          <span className="text-[11px] text-white/60">Share</span>
        </button>
      </div>
    </div>
  );
}

function IdeaCard({
  title,
  author,
  color,
  tag,
}: {
  title: string;
  author: string;
  color: string;
  tag: string;
}) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/4 transition-all hover:border-[#00FF85]/30 hover:bg-white/6">
      <div className="aspect-video w-full" style={{ backgroundColor: color }} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <span className="w-fit rounded-full bg-[#00FF85]/10 px-3 py-0.5 text-[11px] font-medium text-[#00FF85]">
          {tag}
        </span>
        <p className="text-base font-semibold text-white">{title}</p>
        <p className="text-sm text-white/40">by {author}</p>
        <div className="mt-auto flex items-center gap-4 pt-2 text-white/30">
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
        </div>
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
              <ReelCard title={reel.title} author={reel.author} color={reel.color} />
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
                <Home className="size-6" />
                <span className="text-[11px] font-medium">Home</span>
              </button>
            </li>
            <li>
              <button
                type="button"
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
              <Home className="size-5" />
              Feed
            </button>
            <button type="button" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-white/40 transition-colors hover:bg-white/6 hover:text-white/80">
              <Bookmark className="size-5" />
              Saved
            </button>
          </nav>

          <div className="mt-auto">
            <button
              type="button"
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
                author={reel.author}
                color={reel.color}
                tag={reel.tag}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
