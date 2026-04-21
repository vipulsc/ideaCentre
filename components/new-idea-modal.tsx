"use client";

import {
  FileText,
  Heart,
  Music2,
  MessageCircle,
  Share2,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const BG_COLORS = [
  { value: "#000000", label: "Black" },
  { value: "#0A0A0A", label: "Onyx" },
  { value: "#101010", label: "Jet" },
  { value: "#141414", label: "Charcoal" },
  { value: "#181818", label: "Carbon" },
  { value: "#1D1D1D", label: "Graphite" },
  { value: "#222222", label: "Slate Black" },
  { value: "#282828", label: "Gunmetal" },
];

const CATEGORIES = [
  "AI / Health",
  "Community",
  "SaaS",
  "Education",
  "Finance",
  "Sustainability",
  "Entertainment",
  "Other",
];

const MUSIC_TRACKS = [
  { value: "/music/music1.mp3", label: "Track 1", swatch: "#FF00B8", glow: "#FF00B8" },
  { value: "/music/music2.mp3", label: "Track 2", swatch: "#00E5FF", glow: "#00E5FF" },
  { value: "/music/music3.mp3", label: "Track 3", swatch: "#7CFF00", glow: "#7CFF00" },
  { value: "/music/music4.mp3", label: "Track 4", swatch: "#FFD400", glow: "#FFD400" },
  { value: "/music/music5.mp3", label: "Track 5", swatch: "#FF3B30", glow: "#FF3B30" },
  { value: "/music/music6.mp3", label: "Track 6", swatch: "#9D4DFF", glow: "#9D4DFF" },
  { value: "/music/music7.mp3", label: "Track 7", swatch: "#00FF94", glow: "#00FF94" },
  { value: "/music/music8.mp3", label: "Track 8", swatch: "#FF6A00", glow: "#FF6A00" },
  { value: "", label: "No music", swatch: "#2A2A2A", glow: "#6B7280" },
];

const TITLE_MAX_WORDS = 10;
const IDEA_MAX_WORDS = 60;

function countWords(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

function clampWords(text: string, max: number) {
  const words = text.trim().split(/\s+/);
  if (words.length <= max) return text;
  return words.slice(0, max).join(" ");
}

type NewIdeaModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (idea: {
    title: string;
    category: string;
    idea: string;
    description: string;
    color: string;
    music: string | null;
  }) => void;
};

export default function NewIdeaModal({
  open,
  onClose,
  onSubmit,
}: NewIdeaModalProps) {
  const [color, setColor] = useState(BG_COLORS[0].value);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [idea, setIdea] = useState("");
  const [description, setDescription] = useState("");
  const [music, setMusic] = useState<string>("");
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioPreviewRef.current;
    if (!audio) return;
    if (!music) {
      audio.pause();
      audio.currentTime = 0;
      return;
    }
    audio.currentTime = 0;
    void audio.play().catch(() => {
      // Ignore autoplay blocking; user can re-click.
    });
  }, [music]);

  if (!open) return null;

  const titleWords = countWords(title);
  const ideaWords = countWords(idea);
  const canSubmit = title.trim() !== "" && idea.trim() !== "";

  function handleSubmit() {
    if (!canSubmit) return;
    onSubmit({
      title: clampWords(title, TITLE_MAX_WORDS),
      category,
      idea: clampWords(idea, IDEA_MAX_WORDS),
      description,
      color,
      music: music || null,
    });
    setTitle("");
    setCategory(CATEGORIES[0]);
    setIdea("");
    setDescription("");
    setColor(BG_COLORS[0].value);
    setMusic("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="hide-scrollbar relative mx-4 flex max-h-[92vh] w-full max-w-4xl flex-col overflow-y-auto rounded-2xl border border-white/10 bg-[#161616] shadow-2xl md:flex-row md:overflow-hidden">
        {/* Live preview — exact reel card */}
        <div
          className="relative flex shrink-0 flex-col justify-center px-6 py-10 md:w-[340px] md:py-6 lg:w-[400px]"
          style={{ backgroundColor: color }}
        >
          <div className="flex w-full flex-col gap-4">
            <span className="w-fit rounded-full bg-[#00FF85]/15 px-4 py-1 text-xs font-medium text-[#00FF85]">
              {category}
            </span>
            <h2 className="text-2xl font-bold leading-tight text-white lg:text-3xl">
              {title || "Your title here…"}
            </h2>
            <p className="text-sm leading-relaxed text-white/70 lg:text-base">
              {idea || "Your idea will appear here…"}
            </p>
            <p className="text-xs text-white/35">by You</p>
          </div>

          {/* Faux action buttons */}
          <div className="absolute bottom-6 right-4 hidden flex-col items-center gap-4 md:flex">
            <Heart className="size-5 text-white/30" />
            <MessageCircle className="size-5 text-white/30" />
            <Share2 className="size-5 text-white/30" />
          </div>
          <div className="absolute bottom-6 left-6 hidden gap-2 md:flex">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[10px] text-white/40">
              <FileText className="size-3" /> Info
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[10px] text-white/40">
              <Sparkles className="size-3" /> AI
            </span>
          </div>
        </div>

        {/* Form */}
        <div className="hide-scrollbar flex flex-1 flex-col gap-5 overflow-y-auto p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">New Idea</h2>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Background color */}
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-white/60">
              Background
            </legend>
            <div className="flex gap-3">
              {BG_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`h-9 w-9 rounded-full border-2 transition-all ${
                    color === c.value
                      ? "border-[#00FF85] scale-110"
                      : "border-white/15 hover:border-white/40"
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                />
              ))}
            </div>
          </fieldset>

          <div>
            <p className="mb-2 text-sm font-medium text-white/60">Music</p>
            <div className="flex gap-3">
              {MUSIC_TRACKS.map((track) => (
                <button
                  key={track.label}
                  type="button"
                  onClick={() => setMusic(track.value)}
                  className={`relative h-9 w-9 rounded-full border-2 transition-all ${
                    music === track.value
                      ? "border-white scale-110"
                      : "border-white/20 hover:scale-105 hover:border-white/40"
                  }`}
                  style={{
                    backgroundColor: track.swatch,
                    boxShadow:
                      music === track.value
                        ? `0 0 0 2px rgba(255,255,255,0.25), 0 0 14px ${track.glow}, 0 0 26px ${track.glow}`
                        : `0 0 10px ${track.glow}66`,
                  }}
                  title={track.label}
                  aria-label={track.label}
                >
                  {!track.value ? (
                    <X className="absolute inset-0 m-auto size-3.5 text-white" />
                  ) : (
                    <Music2 className="absolute inset-0 m-auto size-3.5 text-black" />
                  )}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-white/40">
              {music
                ? `Selected: ${MUSIC_TRACKS.find((track) => track.value === music)?.label ?? "Track"}`
                : "Selected: No music"}
            </p>
            <audio
              ref={audioPreviewRef}
              src={music || undefined}
              preload="metadata"
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="idea-title"
                className="text-sm font-medium text-white/60"
              >
                Title
              </label>
              <span
                className={`text-xs ${titleWords > TITLE_MAX_WORDS ? "text-[#FF0099]" : "text-white/30"}`}
              >
                {titleWords}/{TITLE_MAX_WORDS}
              </span>
            </div>
            <input
              id="idea-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitle(clampWords(title, TITLE_MAX_WORDS))}
              placeholder="e.g. AI-powered meal planner"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-[#00FF85]/50"
            />
          </div>

          {/* Category */}
          <div>
            <label
              htmlFor="idea-category"
              className="mb-1.5 block text-sm font-medium text-white/60"
            >
              Category
            </label>
            <select
              id="idea-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition-colors focus:border-[#1E90FF]/50"
            >
              {CATEGORIES.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  className="bg-[#161616] text-white"
                >
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Idea */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label
                htmlFor="idea-short"
                className="text-sm font-medium text-white/60"
              >
                Idea
              </label>
              <span
                className={`text-xs ${ideaWords > IDEA_MAX_WORDS ? "text-[#FF0099]" : "text-white/30"}`}
              >
                {ideaWords}/{IDEA_MAX_WORDS}
              </span>
            </div>
            <textarea
              id="idea-short"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              onBlur={() => setIdea(clampWords(idea, IDEA_MAX_WORDS))}
              placeholder="Summarize your idea…"
              rows={3}
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-[#00FF85]/50"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="idea-desc"
              className="mb-1.5 block text-sm font-medium text-white/60"
            >
              Details <span className="text-white/25">(optional)</span>
            </label>
            <textarea
              id="idea-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Elaborate — how it works, who it's for…"
              rows={4}
              className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-[#1E90FF]/50"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/6 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 rounded-xl bg-[#00FF85] px-4 py-2.5 text-sm font-semibold text-[#0D0D0D] transition-colors hover:bg-[#00FF85]/85 disabled:opacity-40 disabled:hover:bg-[#00FF85]"
            >
              Post Idea
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
